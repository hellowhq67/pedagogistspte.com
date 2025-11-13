import { NextResponse } from 'next/server'
import 'server-only'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import {
  pteQuestions,
  readingQuestions,
  speakingQuestions,
  writingQuestions,
} from '@/lib/db/schema'
import {
  resetTables,
  seedReadingQuestions,
  seedSpeakingQuestions,
  seedWritingQuestions,
} from '@/lib/db/seed'
import { initialCategories } from '@/lib/pte/data'

export const preferredRegion = 'auto'
export const maxDuration = 60

type Section = 'speaking' | 'writing' | 'reading' | 'listening'

type Filter = {
  section?: Section
  type?: string
}

const PARENT_TO_SECTION: Record<number, Section> = {
  1: 'speaking',
  7: 'writing',
  10: 'reading',
  16: 'listening',
} as const

function parseFilterFromRequest(request: Request): Filter {
  const { searchParams } = new URL(request.url)
  const rawSection = searchParams.get('section')?.toLowerCase() ?? undefined
  const rawType = searchParams.get('type') ?? undefined

  const allowed: Section[] = ['speaking', 'writing', 'reading', 'listening']
  const section = allowed.includes(rawSection as Section)
    ? (rawSection as Section)
    : undefined

  return {
    section,
    type: rawType,
  }
}

type Target = {
  section: Section
  code: string
  title: string
}

function enumerateTargets(filter?: Filter): Target[] {
  const modules = (initialCategories as Array<any>)
    .filter(
      (c) =>
        typeof c?.parent === 'number' && PARENT_TO_SECTION[c.parent as number]
    )
    .map((c) => {
      const section = PARENT_TO_SECTION[c.parent as number]
      return {
        section,
        code: String(c.code),
        title: String(c.title),
      } as Target
    })

  const filtered = modules.filter((m) => {
    if (filter?.section && m.section !== filter.section) return false
    if (filter?.type && m.code !== filter.type) return false
    return true
  })

  return filtered
}

async function countByType(section: Section, code: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(pteQuestions)
    .where(
      and(
        eq(pteQuestions.section, section),
        eq(pteQuestions.questionType, code)
      )
    )

  const count = rows?.[0]?.count ?? 0
  return Number(count || 0)
}

function currentMonthLowercase(): string {
  try {
    return new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase()
  } catch {
    // Safe fallback if locale is not available for any reason
    const idx = new Date().getUTCMonth()
    const months = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ]
    return months[idx] ?? 'january'
  }
}

function difficultyFor(i: number): 'easy' | 'medium' | 'hard' {
  const m = i % 3
  if (m === 0) return 'easy'
  if (m === 1) return 'medium'
  return 'hard'
}

function tagsFor(i: number): string[] | null {
  // First 3 of each module: weekly_prediction
  if (i < 3) return ['weekly_prediction']
  // Next 2: prediction_<currentMonth> and monthly_prediction
  if (i < 5)
    return [`prediction_${currentMonthLowercase()}`, 'monthly_prediction']
  // Remainder: null
  return null
}

// A realistic passage snippet for Read Aloud
const RA_PASSAGE =
  'In South Australia, most individuals with COVID‑19 experience mild illness and recover without requiring hospital care. ' +
  'Public health measures, including vaccination, timely testing, and responsible isolation, have significantly reduced severe outcomes. ' +
  'Community cooperation remains essential to protect vulnerable populations and maintain the resilience of the healthcare system.'

/**
 * Build a readable, deterministic question text
 */
function buildQuestionText(
  section: Section,
  title: string,
  code: string,
  sampleNumber: number
): string {
  if (section === 'speaking') {
    switch (code) {
      case 's_read_aloud':
        return `Read the passage aloud as naturally as possible. Read Aloud — Sample ${sampleNumber}. ${RA_PASSAGE}`
      case 's_repeat_sentence':
        return `Listen carefully and repeat the sentence exactly as you hear it. Repeat Sentence — Sample ${sampleNumber}.`
      case 's_describe_image':
        return `Describe the image in detail, focusing on key features and trends. Describe Image — Sample ${sampleNumber}.`
      case 's_retell_lecture':
        return `After listening to the lecture, summarize it in your own words. Retell Lecture — Sample ${sampleNumber}.`
      case 's_short_question':
        return `You will hear a question. Answer in one or a few words. Answer Short Question — Sample ${sampleNumber}.`
      case 's_respond_situation_academic':
        return `Listen to the situation and respond clearly and completely. Respond to a Situation — Sample ${sampleNumber}.`
      case 's_summarize_group_discussion':
        return `Summarize the key points of the group discussion you hear. Summarize Group Discussion — Sample ${sampleNumber}.`
      default:
        return `Speaking Practice — ${title} — Sample ${sampleNumber}.`
    }
  }

  // Non-speaking modules
  return `Practice — ${title} — Sample ${sampleNumber}. Focus on accuracy and time management.`
}

/**
 * Minimal questionData shape usable by the UI
 */
function buildQuestionData(
  section: Section,
  code: string
): Record<string, any> {
  if (section === 'speaking') {
    switch (code) {
      case 's_read_aloud':
        return {
          text: RA_PASSAGE,
          timeLimit: 40,
          audioUrl: null,
          imageUrl: null,
        }
      case 's_describe_image':
        return {
          imageUrl: null,
          timeLimit: 40,
        }
      case 's_retell_lecture':
      case 's_repeat_sentence':
      case 's_short_question':
        return {
          audioUrl: null,
          timeLimit: 40,
        }
      default:
        return {
          timeLimit: 40,
        }
    }
  }

  // Non-speaking defaults
  return {
    timeLimit: 60,
  }
}

async function seedType(
  section: Section,
  code: string,
  title: string
): Promise<{
  before: number
  inserted: number
  after: number
}> {
  const before = await countByType(section, code)

  if (before >= 10) {
    return { before, inserted: 0, after: before }
  }

  const need = 10 - before
  const rows = Array.from({ length: need }).map((_, i) => {
    const globalIndex = before + i // 0-based within module; stable for orderIndex/difficulty
    const qText = buildQuestionText(section, title, code, globalIndex + 1)
    return {
      testId: null,
      externalId: null,
      source: 'seed' as const,
      question: qText,
      questionType: code,
      section, // keep lowercased section codes
      questionData: buildQuestionData(section, code),
      tags: tagsFor(globalIndex),
      difficulty: difficultyFor(globalIndex),
      points: 1,
      orderIndex: globalIndex + 1,
    }
  })

  const inserted = (await db.insert(pteQuestions).values(rows).returning())
    .length
  return { before, inserted, after: before + inserted }
}

// GET /api/pte-practice/seed
// Dry-run: report counts per module; optional filters: section, type
export async function GET(request: Request) {
  try {
    const filter = parseFilterFromRequest(request)
    const targets = enumerateTargets(filter)

    const summary = await Promise.all(
      targets.map(async (t) => {
        const before = await countByType(t.section, t.code)
        return {
          section: t.section,
          questionType: t.code,
          before,
          inserted: 0,
          after: before,
        }
      })
    )

    return NextResponse.json(
      {
        ok: true,
        mode: 'dry',
        filter,
        summary,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('[GET /api/pte-practice/seed] error', e)
    return NextResponse.json(
      { ok: false, error: 'Failed to perform dry-run' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pte-practice/seed
 * Extended contract (backwards-compatible):
 * Body (optional):
 * {
 *   "resetAndSeed": boolean,
 *   "targets": { "speaking": boolean, "reading": boolean, "writing": boolean },
 *   "limitPerType"?: number
 * }
 *
 * Behavior:
 * - If body includes any of the extended contract keys, use new speaking/reading/writing seeders.
 * - Otherwise, fall back to legacy pteQuestions seeding (previous behavior).
 */
export async function POST(request: Request) {
  // Try to parse body; if invalid, fall back to legacy behavior below.
  let body: any = null
  try {
    body = await request.json()
  } catch {
    // ignore
  }
  const hasExtendedKeys =
    body &&
    (typeof body.resetAndSeed !== 'undefined' ||
      typeof body.targets !== 'undefined' ||
      typeof body.limitPerType !== 'undefined')

  if (hasExtendedKeys) {
    try {
      const resetAndSeed = Boolean(body.resetAndSeed)
      const targets = {
        speaking: Boolean(body?.targets?.speaking),
        reading: Boolean(body?.targets?.reading),
        writing: Boolean(body?.targets?.writing),
      }
      const limitPerType =
        typeof body?.limitPerType === 'number'
          ? Number(body.limitPerType)
          : undefined

      if (resetAndSeed) {
        await resetTables({
          speaking: targets.speaking,
          reading: targets.reading,
          writing: targets.writing,
        })
      }

      const results: Record<string, any> = {}
      if (targets.speaking) {
        results.speaking = await seedSpeakingQuestions(db, { limitPerType })
      }
      if (targets.reading) {
        results.reading = await seedReadingQuestions(db, { limitPerType })
      }
      if (targets.writing) {
        results.writing = await seedWritingQuestions(db, { limitPerType })
      }

      // Counts per type after inserts
      const speakingByType = targets.speaking
        ? await db
            .select({
              type: speakingQuestions.type,
              count: sql<number>`count(*)`,
            })
            .from(speakingQuestions)
            .groupBy(speakingQuestions.type)
        : []
      const readingByType = targets.reading
        ? await db
            .select({
              type: readingQuestions.type,
              count: sql<number>`count(*)`,
            })
            .from(readingQuestions)
            .groupBy(readingQuestions.type)
        : []
      const writingByType = targets.writing
        ? await db
            .select({
              type: writingQuestions.type,
              count: sql<number>`count(*)`,
            })
            .from(writingQuestions)
            .groupBy(writingQuestions.type)
        : []

      return NextResponse.json(
        {
          ok: true,
          mode: 'seed',
          reset: resetAndSeed,
          targets,
          limitPerType: limitPerType ?? null,
          results,
          counts: {
            speakingByType: speakingByType.map((r) => ({
              type: r.type,
              count: Number((r as any).count ?? 0),
            })),
            readingByType: readingByType.map((r) => ({
              type: r.type,
              count: Number((r as any).count ?? 0),
            })),
            writingByType: writingByType.map((r) => ({
              type: r.type,
              count: Number((r as any).count ?? 0),
            })),
          },
        },
        { status: 200 }
      )
    } catch (e) {
      console.error('[POST /api/pte-practice/seed] extended error', e)
      return NextResponse.json(
        { ok: false, error: 'Failed to seed using extended contract' },
        { status: 500 }
      )
    }
  }

  // Legacy behavior (backwards compatible) - seed pteQuestions per module
  try {
    const filter = parseFilterFromRequest(request)
    const targets = enumerateTargets(filter)

    const summary = await Promise.all(
      targets.map(async (t) => {
        const res = await seedType(t.section, t.code, t.title)
        return {
          section: t.section,
          questionType: t.code,
          ...res,
        }
      })
    )

    return NextResponse.json(
      {
        ok: true,
        mode: 'seed',
        filter,
        summary,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('[POST /api/pte-practice/seed] legacy error', e)
    return NextResponse.json(
      { ok: false, error: 'Failed to seed practice questions (legacy)' },
      { status: 500 }
    )
  }
}
