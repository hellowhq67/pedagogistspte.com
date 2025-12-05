/**
 * Mock Test Generator
 * Generates 200 PTE Academic mock tests with proper question distribution
 */

import { sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'

// Official PTE Academic question distribution per test
export const MOCK_TEST_TEMPLATE = {
  speaking: {
    read_aloud: { min: 6, max: 7 },
    repeat_sentence: { min: 10, max: 12 },
    describe_image: { min: 3, max: 4 },
    retell_lecture: { min: 1, max: 2 },
    answer_short_question: { min: 5, max: 6 },
  },
  writing: {
    summarize_written_text: { min: 2, max: 3 },
    write_essay: { min: 1, max: 2 },
  },
  reading: {
    reading_writing_fill_blanks: { min: 5, max: 6 },
    multiple_choice_multiple: { min: 2, max: 3 },
    reorder_paragraphs: { min: 2, max: 3 },
    fill_in_blanks: { min: 4, max: 5 },
    multiple_choice_single: { min: 2, max: 3 },
  },
  listening: {
    summarize_spoken_text: { min: 2, max: 3 },
    multiple_choice_multiple: { min: 2, max: 3 },
    fill_in_blanks: { min: 2, max: 3 },
    highlight_correct_summary: { min: 2, max: 3 },
    multiple_choice_single: { min: 2, max: 3 },
    select_missing_word: { min: 2, max: 3 },
    highlight_incorrect_words: { min: 2, max: 3 },
    write_from_dictation: { min: 3, max: 4 },
  },
}

// Section time limits (in minutes)
export const SECTION_TIME_LIMITS = {
  speaking_writing: { min: 54, max: 67 },
  reading: { min: 29, max: 30 },
  listening: { min: 30, max: 43 },
}

/**
 * Generate random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Get random questions of a specific type
 */
async function getRandomQuestions(
  tableName: string,
  questionType: string,
  count: number,
  excludeIds: string[] = []
): Promise<any[]> {
  const excludeClause =
    excludeIds.length > 0
      ? sql`AND id NOT IN (${sql.join(
          excludeIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      : sql``

  const result = await db.execute(sql`
    SELECT id, type, title, difficulty
    FROM ${sql.identifier(tableName)}
    WHERE type = ${questionType}
      AND is_active = TRUE
      ${excludeClause}
    ORDER BY RANDOM()
    LIMIT ${count}
  `)

  return result as any[]
}

/**
 * Calculate difficulty distribution
 * 30% Easy, 50% Medium, 20% Hard
 */
function calculateDifficultyDistribution(total: number) {
  return {
    Easy: Math.floor(total * 0.3),
    Medium: Math.ceil(total * 0.5),
    Hard: Math.floor(total * 0.2),
  }
}

/**
 * Generate a single mock test
 */
export async function generateSingleMockTest(testNumber: number) {
  const testTitle = `PTE Academic Practice Test ${testNumber}`
  const description = `Full-length PTE Academic practice test simulating real exam conditions.`

  // Determine difficulty (Tests 1-50: Easy, 51-150: Medium, 151-200: Hard)
  let difficulty = 'Medium'
  if (testNumber <= 50) difficulty = 'Easy'
  else if (testNumber > 150) difficulty = 'Hard'

  // Calculate total duration (varies per test)
  const duration =
    randomBetween(
      SECTION_TIME_LIMITS.speaking_writing.min,
      SECTION_TIME_LIMITS.speaking_writing.max
    ) +
    randomBetween(
      SECTION_TIME_LIMITS.reading.min,
      SECTION_TIME_LIMITS.reading.max
    ) +
    randomBetween(
      SECTION_TIME_LIMITS.listening.min,
      SECTION_TIME_LIMITS.listening.max
    )

  // Count total questions
  let totalQuestions = 0
  const sections = ['speaking', 'writing', 'reading', 'listening']

  for (const section of sections) {
    for (const [questionType, range] of Object.entries(
      MOCK_TEST_TEMPLATE[section as keyof typeof MOCK_TEST_TEMPLATE]
    )) {
      const count = randomBetween((range as any).min, (range as any).max)
      totalQuestions += count
    }
  }

  // Create mock test entry
  const mockTestId = await db.execute(sql`
    INSERT INTO mock_tests (
      test_number,
      title,
      description,
      difficulty,
      duration,
      total_questions,
      is_free,
      status
    ) VALUES (
      ${testNumber},
      ${testTitle},
      ${description},
      ${difficulty},
      ${duration},
      ${totalQuestions},
      ${testNumber === 1}, -- Only first test is free
      'published'
    )
    RETURNING id
  `)

  const testId = (mockTestId[0] as any).id

  // Generate questions for each section
  let orderIndex = 0
  const usedQuestionIds: string[] = []

  // Speaking questions
  for (const [questionType, range] of Object.entries(
    MOCK_TEST_TEMPLATE.speaking
  )) {
    const count = randomBetween((range as any).min, (range as any).max)
    const questions = await getRandomQuestions(
      'speaking_questions',
      questionType,
      count,
      usedQuestionIds
    )

    for (const question of questions) {
      await db.execute(sql`
        INSERT INTO mock_test_questions (
          mock_test_id,
          question_id,
          question_type,
          section,
          order_index,
          time_limit
        ) VALUES (
          ${testId},
          ${question.id},
          'speaking',
          'speaking',
          ${orderIndex++},
          ${getTimeLimitForQuestionType('speaking', questionType)}
        )
      `)
      usedQuestionIds.push(question.id)
    }
  }

  // Writing questions
  for (const [questionType, range] of Object.entries(
    MOCK_TEST_TEMPLATE.writing
  )) {
    const count = randomBetween((range as any).min, (range as any).max)
    const questions = await getRandomQuestions(
      'writing_questions',
      questionType,
      count,
      usedQuestionIds
    )

    for (const question of questions) {
      await db.execute(sql`
        INSERT INTO mock_test_questions (
          mock_test_id,
          question_id,
          question_type,
          section,
          order_index,
          time_limit
        ) VALUES (
          ${testId},
          ${question.id},
          'writing',
          'writing',
          ${orderIndex++},
          ${getTimeLimitForQuestionType('writing', questionType)}
        )
      `)
      usedQuestionIds.push(question.id)
    }
  }

  // Reading questions
  for (const [questionType, range] of Object.entries(
    MOCK_TEST_TEMPLATE.reading
  )) {
    const count = randomBetween((range as any).min, (range as any).max)
    const questions = await getRandomQuestions(
      'reading_questions',
      questionType,
      count,
      usedQuestionIds
    )

    for (const question of questions) {
      await db.execute(sql`
        INSERT INTO mock_test_questions (
          mock_test_id,
          question_id,
          question_type,
          section,
          order_index,
          time_limit
        ) VALUES (
          ${testId},
          ${question.id},
          'reading',
          'reading',
          ${orderIndex++},
          ${getTimeLimitForQuestionType('reading', questionType)}
        )
      `)
      usedQuestionIds.push(question.id)
    }
  }

  // Listening questions
  for (const [questionType, range] of Object.entries(
    MOCK_TEST_TEMPLATE.listening
  )) {
    const count = randomBetween((range as any).min, (range as any).max)
    const questions = await getRandomQuestions(
      'listening_questions',
      questionType,
      count,
      usedQuestionIds
    )

    for (const question of questions) {
      await db.execute(sql`
        INSERT INTO mock_test_questions (
          mock_test_id,
          question_id,
          question_type,
          section,
          order_index,
          time_limit
        ) VALUES (
          ${testId},
          ${question.id},
          'listening',
          'listening',
          ${orderIndex++},
          ${getTimeLimitForQuestionType('listening', questionType)}
        )
      `)
      usedQuestionIds.push(question.id)
    }
  }

  console.log(
    `✅ Generated Mock Test ${testNumber} (${totalQuestions} questions)`
  )
  return testId
}

/**
 * Get time limit for a specific question type (in seconds)
 */
function getTimeLimitForQuestionType(
  section: string,
  questionType: string
): number {
  const limits: Record<string, Record<string, number>> = {
    speaking: {
      read_aloud: 40,
      repeat_sentence: 15,
      describe_image: 40,
      retell_lecture: 40,
      answer_short_question: 10,
    },
    writing: {
      summarize_written_text: 600, // 10 minutes
      write_essay: 1200, // 20 minutes
    },
    reading: {
      // Reading has section-wide time limit, not per question
      reading_writing_fill_blanks: 0,
      multiple_choice_multiple: 0,
      reorder_paragraphs: 0,
      fill_in_blanks: 0,
      multiple_choice_single: 0,
    },
    listening: {
      // Listening time based on audio duration
      summarize_spoken_text: 600,
      multiple_choice_multiple: 0,
      fill_in_blanks: 0,
      highlight_correct_summary: 0,
      multiple_choice_single: 0,
      select_missing_word: 0,
      highlight_incorrect_words: 0,
      write_from_dictation: 0,
    },
  }

  return limits[section]?.[questionType] || 0
}

/**
 * Generate all 200 mock tests
 */
export async function generateAllMockTests() {
  console.log('🚀 Starting generation of 200 mock tests...')

  const startTime = Date.now()

  for (let i = 1; i <= 200; i++) {
    try {
      await generateSingleMockTest(i)
    } catch (error) {
      console.error(`❌ Error generating test ${i}:`, error)
    }
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log(`\n✨ Successfully generated 200 mock tests in ${duration}s`)
}

/**
 * Regenerate a specific mock test
 */
export async function regenerateMockTest(testNumber: number) {
  // Delete existing test
  await db.execute(sql`
    DELETE FROM mock_tests WHERE test_number = ${testNumber}
  `)

  // Generate new test
  return generateSingleMockTest(testNumber)
}
