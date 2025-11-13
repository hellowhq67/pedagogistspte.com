import { NextResponse } from 'next/server'
import {
  resetTables,
  seedListeningQuestions,
  seedReadingQuestions,
  seedSpeakingQuestions,
  seedWritingQuestions,
} from '@/lib/db/seed'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

type Section = 'speaking' | 'reading' | 'writing' | 'listening'

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
    const {
      sections = ['speaking', 'reading', 'writing', 'listening'] as Section[],
      reset = false,
      limitPerType,
    } = json

    // Validate sections
    const validSections = ['speaking', 'reading', 'writing', 'listening']
    const sectionsToSeed = Array.isArray(sections)
      ? sections.filter((s: string) => validSections.includes(s))
      : validSections

    if (sectionsToSeed.length === 0) {
      return error(400, 'No valid sections specified', 'INVALID_SECTIONS')
    }

    const results: Record<string, any> = {}
    const errors: Record<string, string> = {}

    // Optional reset
    if (reset) {
      const resetFlags = {
        speaking: sectionsToSeed.includes('speaking'),
        reading: sectionsToSeed.includes('reading'),
        writing: sectionsToSeed.includes('writing'),
        listening: sectionsToSeed.includes('listening'),
      }
      await resetTables(resetFlags)
      results.reset = 'completed'
    }

    // Seed each section
    const seedPromises = sectionsToSeed.map(async (section) => {
      try {
        let result
        switch (section) {
          case 'speaking':
            result = await seedSpeakingQuestions(undefined, { limitPerType })
            break
          case 'reading':
            result = await seedReadingQuestions(undefined, { limitPerType })
            break
          case 'writing':
            result = await seedWritingQuestions(undefined, { limitPerType })
            break
          case 'listening':
            result = await seedListeningQuestions(undefined, { limitPerType })
            break
        }
        results[section] = result
      } catch (e) {
        console.error(`[seed-all] Error seeding ${section}:`, e)
        errors[section] = e instanceof Error ? e.message : 'Unknown error'
        results[section] = { error: true }
      }
    })

    await Promise.all(seedPromises)

    // Calculate total inserted
    const totalInserted = Object.keys(results)
      .filter((key) => key !== 'reset')
      .reduce((sum, key) => {
        const result = results[key]
        return sum + (result?.inserted || 0)
      }, 0)

    return NextResponse.json(
      {
        success: Object.keys(errors).length === 0,
        results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        message: `Seeded ${totalInserted} total questions across ${sectionsToSeed.length} section(s)`,
        sectionsProcessed: sectionsToSeed,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('[POST /api/seed-all]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
