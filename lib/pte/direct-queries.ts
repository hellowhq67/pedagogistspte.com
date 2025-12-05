// Direct database queries for PTE practice pages
// This module provides optimized queries for the PTE practice interface

import { cache } from 'react'
import { db } from '@/lib/db/drizzle'
import { sql, desc, eq, count, and } from 'drizzle-orm'
import {
  speakingQuestions,
  speakingAttempts,
  readingQuestions,
  readingAttempts,
  writingQuestions,
  writingAttempts,
  listeningQuestions,
  listeningAttempts,
} from '@/lib/db/schema'

// Question counts by type and section
export interface QuestionCounts {
  speaking: {
    read_aloud: number
    repeat_sentence: number
    describe_image: number
    retell_lecture: number
    answer_short_question: number
  }
  writing: {
    summarize_written_text: number
    write_essay: number
  }
  reading: {
    multiple_choice_single: number
    multiple_choice_multiple: number
    reorder_paragraphs: number
    fill_in_blanks: number
    reading_writing_fill_blanks: number
  }
  listening: {
    summarize_spoken_text: number
    multiple_choice_single: number
    multiple_choice_multiple: number
    fill_in_blanks: number
    highlight_correct_summary: number
    select_missing_word: number
    highlight_incorrect_words: number
    write_from_dictation: number
  }
}

export async function getQuestionCounts(): Promise<QuestionCounts> {
  const [
    speakingCounts,
    writingCounts,
    readingCounts,
    listeningCounts,
  ] = await Promise.all([
    getSpeakingQuestionCounts(),
    getWritingQuestionCounts(),
    getReadingQuestionCounts(),
    getListeningQuestionCounts(),
  ])

  return {
    speaking: speakingCounts,
    writing: writingCounts,
    reading: readingCounts,
    listening: listeningCounts,
  }
}

export async function getQuestionsDirectly(
  section: 'speaking' | 'writing' | 'reading' | 'listening',
  questionType: string,
  limit = 10,
  offset = 0
) {
  switch (section) {
    case 'speaking':
      return getSpeakingQuestionsDirectly(questionType, limit, offset)
    case 'writing':
      return getWritingQuestionsDirectly(questionType, limit, offset)
    case 'reading':
      return getReadingQuestionsDirectly(questionType, limit, offset)
    case 'listening':
      return getListeningQuestionsDirectly(questionType, limit, offset)
    default:
      throw new Error(`Invalid section: ${section}`)
  }
}

export async function getQuestionsWithStats(
  section: 'speaking' | 'writing' | 'reading' | 'listening',
  questionType: string,
  userId?: string
) {
  try {
    let questions: any[] = []
    let stats: any = {}

    switch (section) {
      case 'speaking':
        questions = await getSpeakingQuestionsWithStats(questionType, userId)
        stats = await getSpeakingQuestionTypeStats(questionType, userId)
        break
      case 'writing':
        questions = await getWritingQuestionsWithStats(questionType, userId)
        stats = await getWritingQuestionTypeStats(questionType, userId)
        break
      case 'reading':
        questions = await getReadingQuestionsWithStats(questionType, userId)
        stats = await getReadingQuestionTypeStats(questionType, userId)
        break
      case 'listening':
        questions = await getListeningQuestionsWithStats(questionType, userId)
        stats = await getListeningQuestionTypeStats(questionType, userId)
        break
    }

    return {
      questions,
      stats,
    }
  } catch (error) {
    console.error(`Error fetching questions with stats for ${questionType}:`, error)
    return {
      questions: [],
      stats: {
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: 0,
        yourBestScore: 0,
      },
    }
  }
}

// Speaking questions
async function getSpeakingQuestionCounts() {
  const counts = await db
    .select({
      type: speakingQuestions.type,
      count: count(speakingQuestions.id),
    })
    .from(speakingQuestions)
    .where(eq(speakingQuestions.isActive, true))
    .groupBy(speakingQuestions.type)

  const result = {
    read_aloud: 0,
    repeat_sentence: 0,
    describe_image: 0,
    retell_lecture: 0,
    answer_short_question: 0,
  }

  for (const row of counts) {
    const type = row.type as string
    if (type in result) {
      // @ts-ignore
      result[type as keyof typeof result] = Number(row.count)
    }
  }

  return result
}

async function getSpeakingQuestionsWithStats(questionType: string, userId?: string) {
  const questions = await db
    .select({
      id: speakingQuestions.id,
      type: speakingQuestions.type,
      title: speakingQuestions.title,
      promptText: speakingQuestions.promptText,
      promptMediaUrl: speakingQuestions.promptMediaUrl,
      difficulty: speakingQuestions.difficulty,
      tags: speakingQuestions.tags,
      createdAt: speakingQuestions.createdAt,
    })
    .from(speakingQuestions)
    .where(
      and(
        eq(speakingQuestions.type, questionType),
        eq(speakingQuestions.isActive, true)
      )
    )
    .orderBy(desc(speakingQuestions.createdAt))
    .limit(20)

  // If userId is provided, add user statistics
  if (userId && questions.length > 0) {
    const questionIds = questions.map(q => q.id)
    const userAttempts = await db
      .select({
        questionId: speakingAttempts.questionId,
        overallScore: speakingAttempts.overallScore,
        createdAt: speakingAttempts.createdAt,
      })
      .from(speakingAttempts)
      .where(
        and(
          eq(speakingAttempts.userId, userId),
          eq(speakingAttempts.type, questionType)
        )
      )

    const attemptMap = new Map(
      userAttempts.map(attempt => [attempt.questionId, attempt])
    )

    return questions.map(question => ({
      ...question,
      userBestScore: attemptMap.get(question.id)?.overallScore || null,
      totalAttempts: 1, // Simplified for now
    }))
  }

  return questions
}

async function getSpeakingQuestionTypeStats(questionType: string, userId?: string) {
  try {
    const totalQuestions = await db
      .select({ count: count(speakingQuestions.id) })
      .from(speakingQuestions)
      .where(
        and(
          eq(speakingQuestions.type, questionType),
          eq(speakingQuestions.isActive, true)
        )
      )

    const totalAttempts = userId
      ? await db
          .select({ count: count(speakingAttempts.id) })
          .from(speakingAttempts)
          .where(
            and(
              eq(speakingAttempts.userId, userId),
              eq(speakingAttempts.type, questionType)
            )
          )
      : [{ count: 0 }]

    const userBestScore = userId
      ? await db
          .select({
            maxScore: sql<number>`COALESCE(MAX(${speakingAttempts.overallScore}), 0)`,
          })
          .from(speakingAttempts)
          .where(
            and(
              eq(speakingAttempts.userId, userId),
              eq(speakingAttempts.type, questionType),
              sql`${speakingAttempts.overallScore} IS NOT NULL`
            )
          )
      : [{ maxScore: 0 }]

    return {
      totalQuestions: Number(totalQuestions[0].count),
      totalAttempts: Number(totalAttempts[0].count),
      averageScore: 0, // Simplified for now
      yourBestScore: Number(userBestScore[0].maxScore) || 0,
    }
  } catch (error) {
    console.error(`Error fetching stats for ${questionType}:`, error)
    return {
      totalQuestions: 0,
      totalAttempts: 0,
      averageScore: 0,
      yourBestScore: 0,
    }
  }
}

// Writing questions
async function getWritingQuestionCounts() {
  const counts = await db
    .select({
      type: writingQuestions.type,
      count: count(writingQuestions.id),
    })
    .from(writingQuestions)
    .where(eq(writingQuestions.isActive, true))
    .groupBy(writingQuestions.type)

  const result = {
    summarize_written_text: 0,
    write_essay: 0,
  }

  for (const row of counts) {
    const type = row.type as string
    if (type in result) {
      // @ts-ignore
      result[type as keyof typeof result] = Number(row.count)
    }
  }

  return result
}

async function getWritingQuestionsWithStats(questionType: string, userId?: string) {
  const questions = await db
    .select({
      id: writingQuestions.id,
      type: writingQuestions.type,
      title: writingQuestions.title,
      promptText: writingQuestions.promptText,
      options: writingQuestions.options,
      difficulty: writingQuestions.difficulty,
      tags: writingQuestions.tags,
      createdAt: writingQuestions.createdAt,
    })
    .from(writingQuestions)
    .where(
      and(
        eq(writingQuestions.type, questionType),
        eq(writingQuestions.isActive, true)
      )
    )
    .orderBy(desc(writingQuestions.createdAt))
    .limit(20)

  return questions
}

async function getWritingQuestionTypeStats(questionType: string, userId?: string) {
  try {
    const totalQuestions = await db
      .select({ count: count(writingQuestions.id) })
      .from(writingQuestions)
      .where(
        and(
          eq(writingQuestions.type, questionType),
          eq(writingQuestions.isActive, true)
        )
      )

    const totalAttempts = userId
      ? await db
          .select({ count: count(writingAttempts.id) })
          .from(writingAttempts)
          .where(
            and(
              eq(writingAttempts.userId, userId),
              eq(writingAttempts.questionId, sql`${questionType}`)
            )
          )
      : [{ count: 0 }]

    return {
      totalQuestions: Number(totalQuestions[0].count),
      totalAttempts: Number(totalAttempts[0].count),
      averageScore: 0,
      yourBestScore: 0,
    }
  } catch (error) {
    return {
      totalQuestions: 0,
      totalAttempts: 0,
      averageScore: 0,
      yourBestScore: 0,
    }
  }
}

// Reading questions
async function getReadingQuestionCounts() {
  const counts = await db
    .select({
      type: readingQuestions.type,
      count: count(readingQuestions.id),
    })
    .from(readingQuestions)
    .where(eq(readingQuestions.isActive, true))
    .groupBy(readingQuestions.type)

  const result = {
    multiple_choice_single: 0,
    multiple_choice_multiple: 0,
    reorder_paragraphs: 0,
    fill_in_blanks: 0,
    reading_writing_fill_blanks: 0,
  }

  for (const row of counts) {
    const type = row.type as string
    if (type in result) {
      // @ts-ignore
      result[type as keyof typeof result] = Number(row.count)
    }
  }

  return result
}

async function getReadingQuestionsWithStats(questionType: string, userId?: string) {
  const questions = await db
    .select({
      id: readingQuestions.id,
      type: readingQuestions.type,
      title: readingQuestions.title,
      promptText: readingQuestions.promptText,
      options: readingQuestions.options,
      answerKey: readingQuestions.answerKey,
      difficulty: readingQuestions.difficulty,
      tags: readingQuestions.tags,
      createdAt: readingQuestions.createdAt,
    })
    .from(readingQuestions)
    .where(
      and(
        eq(readingQuestions.type, questionType),
        eq(readingQuestions.isActive, true)
      )
    )
    .orderBy(desc(readingQuestions.createdAt))
    .limit(20)

  return questions
}

async function getReadingQuestionTypeStats(questionType: string, userId?: string) {
  try {
    const totalQuestions = await db
      .select({ count: count(readingQuestions.id) })
      .from(readingQuestions)
      .where(
        and(
          eq(readingQuestions.type, questionType),
          eq(readingQuestions.isActive, true)
        )
      )

    const totalAttempts = userId
      ? await db
          .select({ count: count(readingAttempts.id) })
          .from(readingAttempts)
          .where(eq(readingAttempts.userId, userId))
      : [{ count: 0 }]

    return {
      totalQuestions: Number(totalQuestions[0].count),
      totalAttempts: Number(totalAttempts[0].count),
      averageScore: 0,
      yourBestScore: 0,
    }
  } catch (error) {
    return {
      totalQuestions: 0,
      totalAttempts: 0,
      averageScore: 0,
      yourBestScore: 0,
    }
  }
}

// Listening questions
async function getListeningQuestionCounts() {
  const counts = await db
    .select({
      type: listeningQuestions.type,
      count: count(listeningQuestions.id),
    })
    .from(listeningQuestions)
    .where(eq(listeningQuestions.isActive, true))
    .groupBy(listeningQuestions.type)

  const result = {
    summarize_spoken_text: 0,
    multiple_choice_single: 0,
    multiple_choice_multiple: 0,
    fill_in_blanks: 0,
    highlight_correct_summary: 0,
    select_missing_word: 0,
    highlight_incorrect_words: 0,
    write_from_dictation: 0,
  }

  for (const row of counts) {
    const type = row.type as string
    if (type in result) {
      // @ts-ignore
      result[type as keyof typeof result] = Number(row.count)
    }
  }

  return result
}

async function getListeningQuestionsWithStats(questionType: string, userId?: string) {
  const questions = await db
    .select({
      id: listeningQuestions.id,
      type: listeningQuestions.type,
      title: listeningQuestions.title,
      promptText: listeningQuestions.promptText,
      promptMediaUrl: listeningQuestions.promptMediaUrl,
      correctAnswers: listeningQuestions.correctAnswers,
      options: listeningQuestions.options,
      transcript: listeningQuestions.transcript,
      difficulty: listeningQuestions.difficulty,
      tags: listeningQuestions.tags,
      createdAt: listeningQuestions.createdAt,
    })
    .from(listeningQuestions)
    .where(
      and(
        eq(listeningQuestions.type, questionType),
        eq(listeningQuestions.isActive, true)
      )
    )
    .orderBy(desc(listeningQuestions.createdAt))
    .limit(20)

  return questions
}

async function getListeningQuestionTypeStats(questionType: string, userId?: string) {
  try {
    const totalQuestions = await db
      .select({ count: count(listeningQuestions.id) })
      .from(listeningQuestions)
      .where(
        and(
          eq(listeningQuestions.type, questionType),
          eq(listeningQuestions.isActive, true)
        )
      )

    const totalAttempts = userId
      ? await db
          .select({ count: count(listeningAttempts.id) })
          .from(listeningAttempts)
          .where(eq(listeningAttempts.userId, userId))
      : [{ count: 0 }]

    return {
      totalQuestions: Number(totalQuestions[0].count),
      totalAttempts: Number(totalAttempts[0].count),
      averageScore: 0,
      yourBestScore: 0,
    }
  } catch (error) {
    return {
      totalQuestions: 0,
      totalAttempts: 0,
      averageScore: 0,
      yourBestScore: 0,
    }
  }
}

// Direct query functions (simplified implementations)
async function getSpeakingQuestionsDirectly(questionType: string, limit: number, offset: number) {
  return db
    .select()
    .from(speakingQuestions)
    .where(
      and(
        eq(speakingQuestions.type, questionType),
        eq(speakingQuestions.isActive, true)
      )
    )
    .orderBy(desc(speakingQuestions.createdAt))
    .limit(limit)
    .offset(offset)
}

async function getWritingQuestionsDirectly(questionType: string, limit: number, offset: number) {
  return db
    .select()
    .from(writingQuestions)
    .where(
      and(
        eq(writingQuestions.type, questionType),
        eq(writingQuestions.isActive, true)
      )
    )
    .orderBy(desc(writingQuestions.createdAt))
    .limit(limit)
    .offset(offset)
}

async function getReadingQuestionsDirectly(questionType: string, limit: number, offset: number) {
  return db
    .select()
    .from(readingQuestions)
    .where(
      and(
        eq(readingQuestions.type, questionType),
        eq(readingQuestions.isActive, true)
      )
    )
    .orderBy(desc(readingQuestions.createdAt))
    .limit(limit)
    .offset(offset)
}

async function getListeningQuestionsDirectly(questionType: string, limit: number, offset: number) {
  return db
    .select()
    .from(listeningQuestions)
    .where(
      and(
        eq(listeningQuestions.type, questionType),
        eq(listeningQuestions.isActive, true)
      )
    )
    .orderBy(desc(listeningQuestions.createdAt))
    .limit(limit)
    .offset(offset)
}