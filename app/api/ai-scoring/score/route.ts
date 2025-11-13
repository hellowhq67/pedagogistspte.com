import 'server-only'
import { NextResponse } from 'next/server'
import {
  buildError,
  parseScoreRequest,
  toTestSection,
} from '@/app/api/ai-scoring/schemas'
import { scoreWithOrchestrator } from '@/lib/ai/orchestrator'

type ScoreResponse = {
  result: {
    overall: number
    subscores: Record<string, number>
    rationale?: string
    metadata?: Record<string, any>
  }
  trace: {
    section: string
    questionType: string
    attemptId?: string
    userId?: string
    providerPriority?: string[]
    durationMs: number
    timestamp: string
  }
}

// Optional: rate limiting placeholder
// export const runtime = 'edge';

export async function POST(req: Request) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const parsed = parseScoreRequest(body)

    const sectionEnum = toTestSection(parsed.section)
    const providerPriority = parsed.providerPriority

    const result = await scoreWithOrchestrator({
      section: sectionEnum,
      questionType: parsed.questionType,
      payload: parsed.payload,
      includeRationale: parsed.includeRationale,
      providerPriority,
      timeoutMs: parsed.timeoutMs,
    })

    const response: ScoreResponse = {
      result,
      trace: {
        section: parsed.section,
        questionType: parsed.questionType,
        attemptId: parsed.attemptId,
        userId: parsed.userId,
        providerPriority,
        durationMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }

    const res = NextResponse.json(response, { status: 200 })
    res.headers.set('x-duration-ms', String(Date.now() - t0))
    res.headers.set('cache-control', 'no-store')
    return res
  } catch (e: any) {
    const code = e?.code === 'invalid_request' ? 400 : 500
    const err = buildError(
      e?.code || 'internal_error',
      e?.message || 'Unexpected error',
      {
        durationMs: Date.now() - t0,
      }
    )
    const res = NextResponse.json(err, { status: code })
    res.headers.set('x-duration-ms', String(Date.now() - t0))
    res.headers.set('cache-control', 'no-store')
    return res
  }
}
