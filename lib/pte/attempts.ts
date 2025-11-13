// Client helpers for starting validated timing sessions and submitting attempts
// - Robust fetch with retry/backoff
// - Lightweight offline queue (localStorage) with auto-retry when back online
// - Uniform API for Speaking/Writing/Reading/Listening submissions
//
// All submissions attach x-session-token to enable server-side timing validation.

import { ms, timingFor } from '@/lib/pte/timing'

type PteSection = 'speaking' | 'writing' | 'reading' | 'listening'

// Session API
export type StartSessionParams = {
  section: PteSection
  questionType?: string
  questionId: string
  durationMs: number
  startDelayMs?: number
}

export type StartSessionResponse = {
  sessionId: string
  serverNow: number
  startAt: number
  endAt: number
  token: string // signed
}

export type GetSessionResponse = {
  sessionId: string
  serverNow: number
  startAt: number
  endAt: number
  section: PteSection
  questionType?: string
  questionId: string
  token: string
}

// Attempt payloads
export type SpeakingSubmit = {
  token: string
  questionId: string
  type:
    | 'read_aloud'
    | 'repeat_sentence'
    | 'describe_image'
    | 'retell_lecture'
    | 'answer_short_question'
    | 'summarize_group_discussion'
    | 'respond_to_a_situation'
  audioUrl: string
  durationMs: number
  timings?: Record<string, unknown>
}

export type WritingSubmit = {
  token: string
  questionId: string
  type: 'summarize_written_text' | 'write_essay'
  textAnswer: string
  timeTaken?: number // seconds
  timings?: Record<string, unknown>
}

export type ReadingSubmit = {
  token: string
  questionId: string
  type:
    | 'multiple_choice_single'
    | 'multiple_choice_multiple'
    | 'reorder_paragraphs'
    | 'fill_in_blanks'
    | 'reading_writing_fill_blanks'
  userResponse: any
  timeTaken?: number // seconds
  timings?: Record<string, unknown>
}

export type ListeningSubmit = {
  token: string
  questionId: string
  type:
    | 'summarize_spoken_text'
    | 'multiple_choice_single'
    | 'multiple_choice_multiple'
    | 'fill_in_blanks'
    | 'highlight_correct_summary'
    | 'select_missing_word'
    | 'highlight_incorrect_words'
    | 'write_from_dictation'
  userResponse: any
  timeTaken?: number // seconds
  timings?: Record<string, unknown>
}

// Basic fetch with retry + exponential backoff + abort on visibility unload
async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { retries?: number; retryDelayMs?: number } = {}
): Promise<Response> {
  const { retries = 2, retryDelayMs = 400, ...opts } = init
  let attempt = 0
  let lastErr: unknown = null

  while (attempt <= retries) {
    try {
      const start = performance.now()
      const res = await fetch(input, opts)
      // Console telemetry for latency
      console.log('[attempts] fetch', String(input), {
        status: res.status,
        t_ms: Math.round(performance.now() - start),
        attempt,
      })
      if (res.ok || res.status < 500) return res // do not retry 4xx
      // else server error: retry
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastErr = e
    }

    attempt++
    if (attempt > retries) break
    const delay = retryDelayMs * Math.pow(2, attempt - 1)
    await new Promise((r) => setTimeout(r, delay))
  }

  // Throw last error
  throw lastErr instanceof Error ? lastErr : new Error('Network error')
}

// Session helpers
export async function startSession(
  params: StartSessionParams
): Promise<StartSessionResponse> {
  const res = await fetchWithRetry('/api/attempts/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    retries: 1,
  })

  if (!res.ok) {
    const msg =
      (await safeJson(res))?.error || `Failed to start session (${res.status})`
    throw new Error(msg)
  }
  const json = (await res.json()) as StartSessionResponse

  // Light drift telemetry (positive means client ahead)
  const drift = Date.now() - json.serverNow
  if (Math.abs(drift) > 1500) {
    console.warn('[attempts] Timer drift warning (ms):', drift)
  }

  return json
}

export async function getSession(token: string): Promise<GetSessionResponse> {
  const url = `/api/attempts/session?token=${encodeURIComponent(token)}`
  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: { 'x-session-token': token },
    retries: 1,
  })
  if (!res.ok) {
    const msg =
      (await safeJson(res))?.error || `Failed to get session (${res.status})`
    throw new Error(msg)
  }
  return (await res.json()) as GetSessionResponse
}

// Submit wrappers (attach x-session-token)
export async function submitSpeakingAttempt(
  payload: SpeakingSubmit
): Promise<Response> {
  return fetchWithRetry('/api/speaking/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': payload.token,
    },
    body: JSON.stringify({
      questionId: payload.questionId,
      type: payload.type,
      audioUrl: payload.audioUrl,
      durationMs: payload.durationMs,
      timings: payload.timings || {},
    }),
    retries: 1,
  })
}

export async function submitWritingAttempt(
  payload: WritingSubmit
): Promise<Response> {
  return fetchWithRetry('/api/writing/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': payload.token,
    },
    body: JSON.stringify({
      questionId: payload.questionId,
      type: payload.type,
      textAnswer: payload.textAnswer,
      timeTaken: payload.timeTaken ?? undefined,
      timings: payload.timings || {},
    }),
    retries: 1,
  })
}

export async function submitReadingAttempt(
  payload: ReadingSubmit
): Promise<Response> {
  return fetchWithRetry('/api/reading/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': payload.token,
    },
    body: JSON.stringify({
      questionId: payload.questionId,
      type: payload.type,
      userResponse: payload.userResponse,
      timeTaken: payload.timeTaken ?? undefined,
      timings: payload.timings || {},
    }),
    retries: 1,
  })
}

export async function submitListeningAttempt(
  payload: ListeningSubmit
): Promise<Response> {
  return fetchWithRetry('/api/listening/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': payload.token,
    },
    body: JSON.stringify({
      questionId: payload.questionId,
      type: payload.type,
      userResponse: payload.userResponse,
      timeTaken: payload.timeTaken ?? undefined,
      timings: payload.timings || {},
    }),
    retries: 1,
  })
}

// Simple offline queue
type QueuedRequest = {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body: string
  createdAt: number
  attempts: number
}

const QUEUE_KEY = 'pte-attempts-queue'

function loadQueue(): QueuedRequest[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr as QueuedRequest[]
  } catch {
    return []
  }
}

function saveQueue(items: QueuedRequest[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function enqueueSubmission(input: {
  url: string
  method: 'POST'
  headers: Record<string, string>
  body: any
}) {
  const q = loadQueue()
  q.push({
    id: crypto.randomUUID(),
    url: input.url,
    method: input.method,
    headers: input.headers,
    body: JSON.stringify(input.body),
    createdAt: Date.now(),
    attempts: 0,
  })
  saveQueue(q)
  console.log('[attempts] queued submission. size=', q.length)
}

export async function processQueue() {
  const q = loadQueue()
  if (!q.length) return

  const remaining: QueuedRequest[] = []
  for (const item of q) {
    try {
      const res = await fetchWithRetry(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
        retries: 1,
      })
      if (!res.ok) {
        // Keep if 5xx; drop if 4xx (probably invalid permanently)
        if (res.status >= 500) {
          item.attempts++
          remaining.push(item)
        } else {
          console.warn(
            '[attempts] dropping queued submission due to non-retriable status',
            res.status
          )
        }
      } else {
        console.log('[attempts] queued submission sent:', item.id)
      }
    } catch (e) {
      item.attempts++
      remaining.push(item)
    }
  }
  saveQueue(remaining)
}

// Initialize auto-retry when back online and periodic retry
let queueInit = false
export function initQueueAutoRetry() {
  if (queueInit || typeof window === 'undefined') return
  queueInit = true

  const onOnline = () => {
    console.log('[attempts] online: processing queue')
    processQueue().catch(() => {})
  }
  window.addEventListener('online', onOnline)

  // periodic retry every 30s
  const id = window.setInterval(() => {
    processQueue().catch(() => {})
  }, 30_000)

  // noop cleaner on unload
  window.addEventListener('beforeunload', () => {
    window.clearInterval(id)
    window.removeEventListener('online', onOnline)
  })
}

// Convenience: start validated item session (speaking prep+answer window)
export async function startValidatedItemSession(opts: {
  section: PteSection
  questionType?: string
  questionId: string
  prepMs?: number
  answerMs: number
  startDelayMs?: number
}): Promise<StartSessionResponse> {
  const durationMs = Math.max(0, (opts.prepMs || 0) + opts.answerMs)
  return startSession({
    section: opts.section,
    questionType: opts.questionType,
    questionId: opts.questionId,
    durationMs,
    startDelayMs: opts.startDelayMs ?? 0,
  })
}

// Helpers to derive timing quickly for consumers
export function getDefaultTimings(
  section: PteSection,
  questionType?: string
): {
  prepMs?: number
  answerMs?: number
  sectionMs?: number
} {
  const t = timingFor(section, questionType)
  if (t.section === 'speaking')
    return { prepMs: t.prepMs, answerMs: t.answerMs }
  if (t.section === 'writing') return { answerMs: t.answerMs }
  if (t.section === 'reading') return { sectionMs: t.sectionMs }
  if (t.section === 'listening') {
    return 'answerMs' in t
      ? { answerMs: t.answerMs }
      : { sectionMs: t.sectionMs }
  }
  return {}
}

// Utility to parse safe JSON error bodies
async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json()
  } catch {
    return null
  }
}
