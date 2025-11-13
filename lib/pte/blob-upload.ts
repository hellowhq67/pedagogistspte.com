import type { SpeakingType } from '@/lib/pte/types'

export type AudioUploadParams = {
  type: SpeakingType
  questionId: string
  ext?: 'webm' | 'mp3' | 'wav' | 'm4a'
}

type PresignResponse = {
  uploadUrl: string
  blobUrl: string
  pathname: string
  expiresAt: string
}

export async function getAudioUploadUrl(params: AudioUploadParams): Promise<{
  uploadUrl: string
  blobUrl: string
  pathname: string
  expiresAt: string
}> {
  const res = await fetch('/api/uploads/audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  let data: any
  try {
    data = await res.json()
  } catch {
    // ignore parse error, handle by status below
  }

  if (!res.ok) {
    const msg = data?.error || `Failed to get upload URL (${res.status})`
    throw new Error(msg)
  }

  return data as PresignResponse
}

export async function directUploadToPresigned(
  file: Blob,
  presigned: { uploadUrl: string }
): Promise<Response> {
  const fd = new FormData()
  fd.append('file', file)
  // Vercel Blob presigned expects "file" field in multipart body
  return fetch(presigned.uploadUrl, {
    method: 'POST',
    body: fd,
  })
}

export async function uploadAudioWithFallback(
  file: Blob,
  params: AudioUploadParams
): Promise<{ blobUrl: string; pathname: string }> {
  // 1) Try presigned direct upload flow
  try {
    const presigned = await getAudioUploadUrl(params)
    const resp = await directUploadToPresigned(file, {
      uploadUrl: presigned.uploadUrl,
    })

    if (resp.ok) {
      // Vercel Blob returns JSON with the final public URL after upload
      // See: https://vercel.com/docs/storage/vercel-blob
      let json: any = null
      try {
        json = await resp.clone().json()
      } catch {
        // Not JSON? Fallback to text or predicted URL
        try {
          await resp.text()
        } catch {
          // ignore
        }
      }

      const finalUrl: string =
        (json?.url as string) ||
        (json?.blob?.url as string) ||
        presigned.blobUrl

      return { blobUrl: finalUrl, pathname: presigned.pathname }
    }

    // If presigned upload fails, fall through to fallback
  } catch {
    // Ignore and attempt server fallback
  }

  // 2) Fallback to server endpoint (multipart/form-data)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('type', params.type)
  fd.append('questionId', params.questionId)
  if (params.ext) fd.append('ext', params.ext)

  const res = await fetch('/api/uploads/audio', {
    method: 'POST',
    body: fd,
  })

  let data: any
  try {
    data = await res.json()
  } catch {
    // ignore parse error, handle by status below
  }

  if (!res.ok) {
    const msg = data?.error || `Upload failed (${res.status})`
    throw new Error(msg)
  }

  const blobUrl: string = data?.blobUrl
  const pathname: string = data?.pathname
  if (!blobUrl || !pathname) {
    throw new Error(
      'Upload succeeded but response is missing blobUrl or pathname'
    )
  }

  return { blobUrl, pathname }
}
