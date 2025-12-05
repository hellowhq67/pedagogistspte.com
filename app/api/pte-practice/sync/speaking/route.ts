import { NextResponse } from 'next/server'
import 'server-only'
import {
  validateExternalConnectivity,
  type SpeakingTypeCode,
} from '@/lib/pte/onepte-client'
import {
  ALL_SPEAKING_TYPES,
  syncAllSpeaking,
  syncSpeakingType,
} from '@/lib/pte/sync'

type OkJson = {
  ok: true
  mode: 'single' | 'all'
  type?: string
  summary?: unknown
  stats?: unknown
}

type ErrJson = {
  ok: false
  error: string
}

// GET: lightweight health check for external API connectivity
export async function GET() {
  try {
    const health = await validateExternalConnectivity()
    if (!health.ok) {
      return NextResponse.json<ErrJson>(
        { ok: false, error: health.error || 'External connectivity failed' },
        { status: 502 }
      )
    }
    return NextResponse.json<OkJson>({ ok: true, mode: 'all' })
  } catch (e: unknown) {
    const err = e as { message?: unknown }
    return NextResponse.json<ErrJson>(
      { ok: false, error: String(err?.message ?? e) },
      { status: 500 }
    )
  }
}

// POST: trigger sync
// Body: { type?: 's_read_aloud' | 's_repeat_sentence' | 's_describe_image' | 's_retell_lecture' | 's_short_question' | 's_respond_situation_academic' | 's_summarize_group_discussion' }
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const body = isJson ? await req.json().catch(() => ({})) : {}
    const type = (body?.type as string | undefined)?.trim()

    // In a real system add auth guard here (admin-only)
    // Example: const user = await getCurrentUserOrThrow(); check role, etc.

    if (type) {
      // Single-type sync
      if (!ALL_SPEAKING_TYPES.includes(type as SpeakingTypeCode)) {
        return NextResponse.json<ErrJson>(
          { ok: false, error: 'Invalid speaking type' },
          { status: 400 }
        )
      }
      const res = await syncSpeakingType(type as SpeakingTypeCode)
      return NextResponse.json<OkJson>({
        ok: true,
        mode: 'single',
        type,
        stats: res.stats,
      })
    }

    // Full sync for all 7 speaking types
    const summary = await syncAllSpeaking()
    return NextResponse.json<OkJson>({
      ok: true,
      mode: 'all',
      summary,
    })
  } catch (e: unknown) {
    const err = e as { message?: unknown }
    return NextResponse.json<ErrJson>(
      { ok: false, error: String(err?.message ?? e) },
      { status: 500 }
    )
  }
}
