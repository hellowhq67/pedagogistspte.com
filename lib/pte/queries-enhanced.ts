/**
 * Enhanced Query Utilities for PTE Question Statistics
 *
 * Reusable query functions for fetching questions with community and user statistics
 * across all PTE modules (Speaking, Reading, Writing, Listening).
 *
 * These utilities follow Pearson's PTE Academic AI scoring principles:
 * - Machine learning-based scoring with human expert training
 * - Comprehensive trait analysis (content, pronunciation, fluency, etc.)
 * - Fair and consistent assessment across all test takers
 */

import { db } from '@/lib/db'
import { sql, eq, and, type SQL } from 'drizzle-orm'
import { getSession } from '@/lib/auth/server'
import type { QuestionWithStats } from './types-enhanced'

/**
 * Generic function to get questions with statistics for any module
 *
 * @param questionTable - The Drizzle table for questions
 * @param attemptsTable - The Drizzle table for attempts
 * @param questionType - The type of question (e.g., 'read_aloud', 'multiple_choice_single')
 * @param limit - Maximum number of questions to return
 * @returns Array of questions with community and user statistics
 */
export async function getQuestionsWithStats<TQuestion, TAttempt>({
  questionTable,
  attemptsTable,
  questionType,
  additionalWhereConditions = [],
  limit = 100,
  scoreField = 'overallScore', // Default for speaking/writing
}: {
  questionTable: any
  attemptsTable: any
  questionType: string
  additionalWhereConditions?: SQL[]
  limit?: number
  scoreField?: string
}): Promise<QuestionWithStats[]> {
  try {
    const session = await getSession()
    const userId = session?.user?.id

    // Build where conditions
    const whereConditions: SQL[] = [
      eq(questionTable.type, questionType),
      eq(questionTable.isActive, true),
      ...additionalWhereConditions,
    ]

    // Enhanced query with community and user stats
    const questions = await db
      .select({
        id: questionTable.id,
        title: questionTable.title,
        promptText: questionTable.promptText,
        type: questionTable.type,
        difficulty: questionTable.difficulty,
        bookmarked: questionTable.bookmarked,
        isActive: questionTable.isActive,
        createdAt: questionTable.createdAt,
        updatedAt: questionTable.updatedAt,

        // Community stats - count distinct users who practiced this question
        communityPracticeCount: sql<number>`
          COALESCE(
            (SELECT COUNT(DISTINCT user_id)
             FROM ${attemptsTable}
             WHERE ${attemptsTable.questionId} = ${questionTable.id}),
            0
          )
        `.mapWith(Number),

        // Community average score
        communityAverageScore: sql<number | null>`
          (SELECT AVG(${sql.identifier(scoreField)})
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id})
        `,

        // Unique users count
        uniqueUsersCount: sql<number>`
          COALESCE(
            (SELECT COUNT(DISTINCT user_id)
             FROM ${attemptsTable}
             WHERE ${attemptsTable.questionId} = ${questionTable.id}),
            0
          )
        `.mapWith(Number),

        // User-specific stats (only if logged in)
        userPracticeCount: userId
          ? sql<number>`
          COALESCE(
            (SELECT COUNT(*)
             FROM ${attemptsTable}
             WHERE ${attemptsTable.questionId} = ${questionTable.id}
               AND ${attemptsTable.userId} = ${userId}),
            0
          )
        `.mapWith(Number)
          : sql<number>`0`.mapWith(Number),

        userAverageScore: userId
          ? sql<number | null>`
          (SELECT AVG(${sql.identifier(scoreField)})
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id}
             AND ${attemptsTable.userId} = ${userId})
        `
          : sql<number | null>`NULL`,

        userBestScore: userId
          ? sql<number | null>`
          (SELECT MAX(${sql.identifier(scoreField)})
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id}
             AND ${attemptsTable.userId} = ${userId})
        `
          : sql<number | null>`NULL`,

        lastAttemptDate: userId
          ? sql<string | null>`
          (SELECT MAX(created_at)::text
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id}
             AND ${attemptsTable.userId} = ${userId})
        `
          : sql<string | null>`NULL`,
      })
      .from(questionTable)
      .where(and(...whereConditions))
      .orderBy(questionTable.createdAt)
      .limit(limit)

    return questions.map((q: any) => ({
      ...q,
      promptPreview: q.promptText?.substring(0, 100) || q.title.substring(0, 100),
      difficulty: (q.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
      bookmarked: q.bookmarked || false,
      userPracticeCount: q.userPracticeCount || 0,
      communityPracticeCount: q.communityPracticeCount || 0,
      uniqueUsersCount: q.uniqueUsersCount || 0,
      tags: [], // Can be enhanced with actual tags from database
    }))
  } catch (error) {
    console.error(`Error fetching questions with stats for ${questionType}:`, error)
    return []
  }
}

/**
 * Get overview statistics for a specific question type
 *
 * @param questionTable - The Drizzle table for questions
 * @param attemptsTable - The Drizzle table for attempts
 * @param questionType - The type of question
 * @param scoreField - The field name for scores (varies by module)
 * @returns Statistics object with totals and averages
 */
export async function getQuestionTypeStats({
  questionTable,
  attemptsTable,
  questionType,
  scoreField = 'overallScore',
}: {
  questionTable: any
  attemptsTable: any
  questionType: string
  scoreField?: string
}) {
  try {
    const stats = await db
      .select({
        totalQuestions: sql<number>`COUNT(DISTINCT ${questionTable.id})`.mapWith(Number),
        totalAttempts: sql<number>`COUNT(${attemptsTable.id})`.mapWith(Number),
        averageScore: sql<number | null>`AVG(${sql.identifier(scoreField)})`,
        totalUsers: sql<number>`COUNT(DISTINCT ${attemptsTable.userId})`.mapWith(Number),
      })
      .from(questionTable)
      .leftJoin(attemptsTable, eq(attemptsTable.questionId, questionTable.id))
      .where(
        and(
          eq(questionTable.type, questionType),
          eq(questionTable.isActive, true)
        )
      )

    return (
      stats[0] || {
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: null,
        totalUsers: 0,
      }
    )
  } catch (error) {
    console.error(`Error fetching stats for ${questionType}:`, error)
    return {
      totalQuestions: 0,
      totalAttempts: 0,
      averageScore: null,
      totalUsers: 0,
    }
  }
}

/**
 * Speaking Module Specific Helpers
 */
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'

export async function getSpeakingQuestionsWithStats(
  questionType: string,
  limit = 100
): Promise<QuestionWithStats[]> {
  return getQuestionsWithStats({
    questionTable: speakingQuestions,
    attemptsTable: speakingAttempts,
    questionType,
    limit,
    scoreField: 'overallScore',
  })
}

export async function getSpeakingQuestionTypeStats(questionType: string) {
  return getQuestionTypeStats({
    questionTable: speakingQuestions,
    attemptsTable: speakingAttempts,
    questionType,
    scoreField: 'overallScore',
  })
}

/**
 * Reading Module Specific Helpers
 */
import { readingQuestions, readingAttempts } from '@/lib/db/schema'

export async function getReadingQuestionsWithStats(
  questionType: string,
  limit = 100
): Promise<QuestionWithStats[]> {
  return getQuestionsWithStats({
    questionTable: readingQuestions,
    attemptsTable: readingAttempts,
    questionType,
    limit,
    scoreField: 'accuracy', // Reading uses accuracy percentage
  })
}

export async function getReadingQuestionTypeStats(questionType: string) {
  return getQuestionTypeStats({
    questionTable: readingQuestions,
    attemptsTable: readingAttempts,
    questionType,
    scoreField: 'accuracy',
  })
}

/**
 * Writing Module Specific Helpers
 */
import { writingQuestions, writingAttempts } from '@/lib/db/schema'

export async function getWritingQuestionsWithStats(
  questionType: string,
  limit = 100
): Promise<QuestionWithStats[]> {
  return getQuestionsWithStats({
    questionTable: writingQuestions,
    attemptsTable: writingAttempts,
    questionType,
    limit,
    scoreField: 'totalScore', // Writing uses totalScore
  })
}

export async function getWritingQuestionTypeStats(questionType: string) {
  return getQuestionTypeStats({
    questionTable: writingQuestions,
    attemptsTable: writingAttempts,
    questionType,
    scoreField: 'totalScore',
  })
}

/**
 * Listening Module Specific Helpers
 */
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'

export async function getListeningQuestionsWithStats(
  questionType: string,
  limit = 100
): Promise<QuestionWithStats[]> {
  return getQuestionsWithStats({
    questionTable: listeningQuestions,
    attemptsTable: listeningAttempts,
    questionType,
    limit,
    scoreField: 'accuracy', // Listening uses accuracy percentage
  })
}

export async function getListeningQuestionTypeStats(questionType: string) {
  return getQuestionTypeStats({
    questionTable: listeningQuestions,
    attemptsTable: listeningAttempts,
    questionType,
    scoreField: 'accuracy',
  })
}

/**
 * Utility: Format score for display based on module
 */
export function formatScoreByModule(
  score: number | null,
  module: 'speaking' | 'reading' | 'writing' | 'listening'
): string {
  if (score === null) return 'N/A'

  switch (module) {
    case 'speaking':
    case 'writing':
      return `${Math.round(score)}/90`
    case 'reading':
    case 'listening':
      return `${Math.round(score)}%`
    default:
      return String(Math.round(score))
  }
}

interface QuestionNavigationContext {
  totalQuestions: number;
  currentIndex: number;
  prevQuestionId: string | null;
  nextQuestionId: string | null;
}

export async function getQuestionNavigationContext<TQuestion>({
  questionTable,
  currentQuestionId,
  questionType,
}: {
  questionTable: any; // Drizzle table
  currentQuestionId: string;
  questionType: string;
}): Promise<QuestionNavigationContext> {
  try {
    const allQuestions = await db
      .select({ id: questionTable.id })
      .from(questionTable)
      .where(and(
        eq(questionTable.type, questionType),
        eq(questionTable.isActive, true)
      ))
      .orderBy(questionTable.createdAt);

    const totalQuestions = allQuestions.length;
    const currentIndex = allQuestions.findIndex(q => q.id === currentQuestionId);

    if (currentIndex === -1) {
      // Current question not found or not active
      return {
        totalQuestions: 0,
        currentIndex: -1,
        prevQuestionId: null,
        nextQuestionId: null,
      };
    }

    const prevQuestionId = currentIndex > 0 ? allQuestions[currentIndex - 1].id : null;
    const nextQuestionId = currentIndex < totalQuestions - 1 ? allQuestions[currentIndex + 1].id : null;

    return {
      totalQuestions,
      currentIndex,
      prevQuestionId,
      nextQuestionId,
    };
  } catch (error) {
    console.error(`Error getting question navigation context for ${questionType} - ${currentQuestionId}:`, error);
    return {
      totalQuestions: 0,
      currentIndex: -1,
      prevQuestionId: null,
      nextQuestionId: null,
    };
  }
}

/**
 * Generic function to get a single question by ID with statistics for any module
 *
 * @param questionTable - The Drizzle table for questions
 * @param attemptsTable - The Drizzle table for attempts
 * @param questionId - The ID of the question to fetch
 * @param scoreField - The field name for scores (varies by module)
 * @returns QuestionWithStats object or null if not found
 */
export async function getQuestionByIdWithStats<TQuestion, TAttempt>({
  questionTable,
  attemptsTable,
  questionId,
  scoreField = 'overallScore', // Default for speaking/writing
}: {
  questionTable: any
  attemptsTable: any
  questionId: string
  scoreField?: string
}): Promise<QuestionWithStats | null> {
  try {
    const session = await getSession()
    const userId = session?.user?.id

    const questions = await db
      .select({
        id: questionTable.id,
        title: questionTable.title,
        promptText: questionTable.promptText,
        type: questionTable.type,
        difficulty: questionTable.difficulty,
        bookmarked: questionTable.bookmarked,
        isActive: questionTable.isActive,
        createdAt: questionTable.createdAt,
        updatedAt: questionTable.updatedAt,
        // Add specific fields for each question type here if needed
        // For example, for Read Aloud:
        audioUrl: questionTable.audioUrl,
        // For other types, you might have different fields like image, options, etc.

        // Community stats
        communityPracticeCount: sql<number>`
          COALESCE(
            (SELECT COUNT(DISTINCT user_id)
             FROM ${attemptsTable}
             WHERE ${attemptsTable.questionId} = ${questionTable.id}),
            0
          )
        `.mapWith(Number),

        communityAverageScore: sql<number | null>`
          (SELECT AVG(${sql.identifier(scoreField)})
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id})
        `,

        uniqueUsersCount: sql<number>`
          COALESCE(
            (SELECT COUNT(DISTINCT user_id)
             FROM ${attemptsTable}
             WHERE ${attemptsTable.questionId} = ${questionTable.id}),
            0
          )
        `.mapWith(Number),

        // User-specific stats
        userPracticeCount: userId
          ? sql<number>`
          COALESCE(
            (SELECT COUNT(*)
             FROM ${attemptsTable}
             WHERE ${attemptsTable.questionId} = ${questionTable.id}
               AND ${attemptsTable.userId} = ${userId}),
            0
          )
        `.mapWith(Number)
          : sql<number>`0`.mapWith(Number),

        userAverageScore: userId
          ? sql<number | null>`
          (SELECT AVG(${sql.identifier(scoreField)})
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id}
             AND ${attemptsTable.userId} = ${userId})
        `
          : sql<number | null>`NULL`,

        userBestScore: userId
          ? sql<number | null>`
          (SELECT MAX(${sql.identifier(scoreField)})
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id}
             AND ${attemptsTable.userId} = ${userId})
        `
          : sql<number | null>`NULL`,

        lastAttemptDate: userId
          ? sql<string | null>`
          (SELECT MAX(created_at)::text
           FROM ${attemptsTable}
           WHERE ${attemptsTable.questionId} = ${questionTable.id}
             AND ${attemptsTable.userId} = ${userId})
        `
          : sql<string | null>`NULL`,
      })
      .from(questionTable)
      .where(and(eq(questionTable.id, questionId), eq(questionTable.isActive, true)))
      .limit(1)

    if (!questions || questions.length === 0) {
      return null
    }

    const q = questions[0]

    return {
      ...q,
      promptPreview: q.promptText?.substring(0, 100) || q.title.substring(0, 100),
      difficulty: (q.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
      bookmarked: q.bookmarked || false,
      userPracticeCount: q.userPracticeCount || 0,
      communityPracticeCount: q.communityPracticeCount || 0,
      uniqueUsersCount: q.uniqueUsersCount || 0,
      tags: [], // Can be enhanced with actual tags from database
    } as QuestionWithStats
  } catch (error) {
    console.error(`Error fetching question with stats for ID ${questionId}:`, error)
    return null
  }
}

