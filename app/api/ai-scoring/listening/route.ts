import 'server-only'
import { NextResponse } from 'next/server'
import { buildError, parseScoreRequest } from '@/app/api/ai-scoring/schemas'
import { scoreWithOrchestrator } from '@/lib/ai/orchestrator'
// Import after to avoid potential edge bundling issues
import { TestSection } from '@/lib/pte/types'

// Thin wrapper around unified /score endpoint; forces section = LISTENING
export async function POST(req: Request) {
  const t0 = Date.now()
  try {
    const raw = await req.json()
    const parsed = parseScoreRequest({ ...raw, section: 'LISTENING' })

    const result = await scoreWithOrchestrator({
      section: TestSection.LISTENING,
      questionType: parsed.questionType,
      payload: parsed.payload,
      includeRationale: parsed.includeRationale,
      providerPriority: parsed.providerPriority,
      timeoutMs: parsed.timeoutMs,
    })

    const res = NextResponse.json(
      {
        result,
        trace: {
          section: 'LISTENING',
          questionType: parsed.questionType,
          attemptId: parsed.attemptId,
          userId: parsed.userId,
          providerPriority: parsed.providerPriority,
          durationMs: Date.now() - t0,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
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
