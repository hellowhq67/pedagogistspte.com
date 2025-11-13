// Uploads: PTE Speaking audio to Vercel Blob
// Required env:
// - VERCEL_BLOB_READ_WRITE_TOKEN (required for both presigned and server fallback)
// Optional:
// - None specific; route runs in Node runtime (not Edge) to allow multipart handling.
//
// Modes in single POST endpoint:
// a) Presigned upload URL generation (application/json)
//    Request JSON: { "type": SpeakingType, "questionId": string, "ext"?: "webm"|"mp3"|"wav"|"m4a" }
//    Response JSON: { "uploadUrl": string, "blobUrl": string, "pathname": string, "expiresAt": string }
//    Note: "blobUrl" is a predicted public URL based on pathname; after client upload, the service returns the actual public URL.
//          Clients should prefer the URL returned by the presigned upload response body after the upload.
// b) Server fallback upload (multipart/form-data)
//    Content-Type: multipart/form-data
//    Fields: file (required), type (optional), questionId (optional), ext (optional)
//    Response JSON: { "blobUrl": string, "pathname": string, "size": number, "contentType": string }
//
// Security/Validation:
// - Auth required via getSession()
// - Max size: 15MB
// - Allowed MIME: audio/webm, audio/mpeg, audio/mp3, audio/wav, audio/x-wav, audio/mp4, audio/m4a
// - Same-origin CORS only (no special headers added)

import 'server-only'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import type { SpeakingType } from '@/lib/pte/types'

export const preferredRegion = 'auto'
export const maxDuration = 60

type JsonError = { error: string; code?: string }

// Minimal type interfaces for @vercel/blob dynamic imports
interface GenerateUploadUrlParams {
  pathname: string
  access: 'public'
  token: string
  allowedContentTypes?: string[]
  contentType?: string
}

interface GenerateUploadUrlResult {
  url?: string
  uploadUrl?: string
  upload?: { url: string }
  expiresAt?: number | string
}

type GenerateUploadUrlFn = (
  params: GenerateUploadUrlParams
) => Promise<GenerateUploadUrlResult>

interface PutParams {
  access: 'public'
  contentType: string
  token: string
}

interface PutResult {
  url?: string
}

type PutFn = (
  pathname: string,
  file: Blob | ArrayBuffer | Uint8Array,
  params: PutParams
) => Promise<PutResult>

// Helper to safely extract error properties from unknown
function asError(e: unknown): { message: string; code?: string } {
  if (e instanceof Error) {
    return {
      message: e.message,
      code: 'code' in e && typeof e.code === 'string' ? e.code : undefined,
    }
  }
  if (typeof e === 'object' && e !== null) {
    const message =
      'message' in e && typeof e.message === 'string' ? e.message : String(e)
    const code = 'code' in e && typeof e.code === 'string' ? e.code : undefined
    return { message, code }
  }
  return { message: String(e) }
}

const MAX_BYTES = 15 * 1024 * 1024 // 15MB
const ALLOWED_MIME = new Set([
  'audio/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
])

const ALLOWED_EXT = new Set(['webm', 'mp3', 'wav', 'm4a'])
const ALLOWED_TYPES: SpeakingType[] = [
  'read_aloud',
  'repeat_sentence',
  'describe_image',
  'retell_lecture',
  'answer_short_question',
  'summarize_group_discussion',
  'respond_to_a_situation',
]

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

function ensureEnvToken() {
  const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw Object.assign(
      new Error('Missing env: VERCEL_BLOB_READ_WRITE_TOKEN'),
      { code: 'MISSING_BLOB_TOKEN' }
    )
  }
  return token
}

function normalizeExt(raw?: string | null): 'webm' | 'mp3' | 'wav' | 'm4a' {
  const e = (raw || '').trim().toLowerCase()
  if (ALLOWED_EXT.has(e)) {
    return e as 'webm' | 'mp3' | 'wav' | 'm4a'
  }
  return 'webm'
}

function guessContentTypeFromExt(ext: 'webm' | 'mp3' | 'wav' | 'm4a'): string {
  switch (ext) {
    case 'webm':
      return 'audio/webm'
    case 'mp3':
      return 'audio/mpeg'
    case 'wav':
      return 'audio/wav'
    case 'm4a':
      return 'audio/m4a'
    default:
      return 'application/octet-stream'
  }
}

function isValidSpeakingType(t: unknown): t is SpeakingType {
  return typeof t === 'string' && (ALLOWED_TYPES as string[]).includes(t)
}

function buildPathname(
  type: SpeakingType,
  questionId: string,
  ext: 'webm' | 'mp3' | 'wav' | 'm4a'
): string {
  const id = randomUUID()
  return `pte/speaking/${type}/${questionId}/${id}.${ext}`
}

function predictedPublicUrl(pathname: string): string {
  // Predictable public URL path; final host is determined by Vercel Blob store.
  // Clients should prefer the URL returned by the upload call after presigned upload completes.
  return `https://public.blob.vercel-storage.com/${pathname}`
}

async function handleJsonPresign(request: Request, requestId: string) {
  // Auth
  const session = await getSession()
  if (!session?.user?.id) return error(401, 'Unauthorized', 'UNAUTHORIZED')

  // Env guard
  let token: string
  try {
    token = ensureEnvToken()
  } catch (e: unknown) {
    const err = asError(e)
    console.error('[uploads.audio.presign.env]', { requestId, error: e })
    return error(
      500,
      err.message || 'Server not configured for Blob',
      err.code || 'SERVER_MISCONFIGURED'
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return error(400, 'Invalid JSON body', 'BAD_REQUEST')
  }

  const { type, questionId, ext } = json as {
    type?: unknown
    questionId?: unknown
    ext?: string
  }
  if (!isValidSpeakingType(type)) {
    return error(400, 'Invalid "type" provided', 'BAD_REQUEST')
  }
  if (typeof questionId !== 'string' || !questionId.trim()) {
    return error(400, 'Invalid "questionId" provided', 'BAD_REQUEST')
  }

  const finalExt = normalizeExt(ext)
  const pathname = buildPathname(type, questionId.trim(), finalExt)
  const contentType = guessContentTypeFromExt(finalExt)

  try {
    // Dynamic import of @vercel/blob
    // Dynamic import via Function constructor to avoid bundler resolution of optional dependency
    const mod = await (Function(
      'specifier',
      'return import(specifier)'
    )('@vercel/blob') as Promise<any>)
    const generateUploadUrl = mod?.generateUploadUrl as
      | GenerateUploadUrlFn
      | undefined
    if (typeof generateUploadUrl !== 'function') {
      throw Object.assign(new Error('generateUploadUrl() not available'), {
        code: 'NO_PRESIGN_FN',
      })
    }

    // Best-effort invocation; API differs across versions. Pass commonly supported fields.
    const presignResult = await generateUploadUrl({
      pathname,
      access: 'public',
      token,
      allowedContentTypes: Array.from(ALLOWED_MIME),
      contentType,
    })

    const uploadUrl =
      presignResult?.url ||
      presignResult?.uploadUrl ||
      presignResult?.upload?.url
    const expiresAtIso: string = new Date(
      presignResult?.expiresAt
        ? Number(presignResult.expiresAt)
        : Date.now() + 10 * 60 * 1000
    ).toISOString()

    if (!uploadUrl) {
      throw Object.assign(new Error('Failed to generate upload URL'), {
        code: 'PRESIGN_FAILED',
      })
    }

    // The final public URL is only known after upload; provide a predicted URL for convenience.
    const blobUrl = predictedPublicUrl(pathname)

    return NextResponse.json(
      {
        uploadUrl,
        blobUrl,
        pathname,
        expiresAt: expiresAtIso,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    console.error('[uploads.audio.presign]', { requestId, error: e })
    // Explicitly instruct clients to fall back to server multipart
    return error(
      501,
      'Presigned upload not available; use multipart fallback',
      'PRESIGN_UNAVAILABLE'
    )
  }
}

async function handleMultipartFallback(request: Request, requestId: string) {
  // Auth
  const session = await getSession()
  if (!session?.user?.id) return error(401, 'Unauthorized', 'UNAUTHORIZED')

  // Env guard
  let token: string
  try {
    token = ensureEnvToken()
  } catch (e: unknown) {
    const err = asError(e)
    console.error('[uploads.audio.multipart.env]', { requestId, error: e })
    return error(
      500,
      err.message || 'Server not configured for Blob',
      err.code || 'SERVER_MISCONFIGURED'
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return error(400, 'Invalid multipart form data', 'BAD_REQUEST')
  }

  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return error(400, 'Missing "file" field', 'BAD_REQUEST')
  }

  // Size enforcement
  const size =
    'size' in file && typeof file.size === 'number'
      ? file.size
      : (await file.arrayBuffer()).byteLength
  if (typeof size !== 'number' || size <= 0) {
    return error(400, 'Invalid file content', 'BAD_REQUEST')
  }
  if (size > MAX_BYTES) {
    return error(413, 'File too large: max 15 MB', 'PAYLOAD_TOO_LARGE')
  }

  // Mime/type validations
  const incomingMime =
    'type' in file && typeof file.type === 'string' ? file.type : ''
  const contentType = ALLOWED_MIME.has(incomingMime) ? incomingMime : ''

  // Supplemental fields
  const rawType = form.get('type')
  const rawQuestionId = form.get('questionId')
  const rawExt = form.get('ext')

  if (!isValidSpeakingType(rawType)) {
    return error(400, 'Invalid or missing "type"', 'BAD_REQUEST')
  }
  if (typeof rawQuestionId !== 'string' || !rawQuestionId.trim()) {
    return error(400, 'Invalid or missing "questionId"', 'BAD_REQUEST')
  }

  const finalExt = normalizeExt(typeof rawExt === 'string' ? rawExt : undefined)
  const pathname = buildPathname(rawType, rawQuestionId.trim(), finalExt)

  // Compute final contentType preference
  const finalContentType = contentType || guessContentTypeFromExt(finalExt)
  if (!ALLOWED_MIME.has(finalContentType)) {
    return error(415, 'Unsupported media type', 'UNSUPPORTED_MEDIA_TYPE')
  }

  try {
    // Dynamic import via Function constructor to avoid bundler resolution of optional dependency
    const mod = await (Function(
      'specifier',
      'return import(specifier)'
    )('@vercel/blob') as Promise<any>)
    const put = mod?.put as PutFn | undefined
    if (typeof put !== 'function') {
      throw Object.assign(new Error('put() not available in @vercel/blob'), {
        code: 'NO_PUT_FN',
      })
    }

    const result = await put(pathname, file, {
      access: 'public',
      contentType: finalContentType,
      token,
    })

    const blobUrl: string = result?.url || predictedPublicUrl(pathname)

    return NextResponse.json(
      {
        blobUrl,
        pathname,
        size,
        contentType: finalContentType,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    console.error('[uploads.audio.multipart]', { requestId, error: e })
    return error(500, 'Failed to upload file', 'UPLOAD_FAILED')
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || randomUUID()
  try {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await handleJsonPresign(request, requestId)
    }
    if (contentType.includes('multipart/form-data')) {
      return await handleMultipartFallback(request, requestId)
    }
    return error(
      415,
      'Unsupported Content-Type. Use application/json or multipart/form-data',
      'UNSUPPORTED_MEDIA_TYPE'
    )
  } catch (e: unknown) {
    console.error('[uploads.audio.POST]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
