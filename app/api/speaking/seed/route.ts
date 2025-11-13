import { NextResponse } from 'next/server'
import { resetTables, seedSpeakingQuestions } from '@/lib/db/seed'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(
        415,
        'Content-Type must be application/json',
        'UNSUPPORTED_MEDIA_TYPE'
      )
    }

    const json = await request.json()
    const { reset = false, limitPerType } = json

    // Optional reset
    if (reset) {
      await resetTables({ speaking: true })
    }

    // Seed speaking questions
    const result = await seedSpeakingQuestions(undefined, { limitPerType })

    return NextResponse.json(
      {
        success: true,
        result,
        message: `Seeded ${result.inserted} speaking questions`,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('[POST /api/speaking/seed]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
