'use server'

import { db } from '@/lib/db/drizzle'
import {
    speakingQuestions,
    writingQuestions,
    readingQuestions,
    listeningQuestions,
    speakingAttempts,
    writingAttempts,
    readingAttempts,
    listeningAttempts,
} from '@/lib/db/schema'
import { eq, and, desc, sql, ilike } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth' // Assuming auth is set up
import { headers } from 'next/headers'

// Helper to get user (replace with actual auth logic if different)
async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    return session?.user
}

// ----------------------------------------------------------------------
// Generic Helpers
// ----------------------------------------------------------------------

const TABLE_MAP = {
    speaking: speakingQuestions,
    writing: writingQuestions,
    reading: readingQuestions,
    listening: listeningQuestions,
}

const ATTEMPT_MAP = {
    speaking: speakingAttempts,
    writing: writingAttempts,
    reading: readingAttempts,
    listening: listeningAttempts,
}

// ----------------------------------------------------------------------
// Fetch Questions
// ----------------------------------------------------------------------

export async function getQuestions({
    type,
    category, // 'speaking', 'writing', etc.
    page = 1,
    limit = 10,
    difficulty,
    status, // 'all', 'completed', 'new'
}: {
    type?: string
    category: 'speaking' | 'writing' | 'reading' | 'listening'
    page?: number
    limit?: number
    difficulty?: string
    status?: string
}) {
    const table = TABLE_MAP[category]
    if (!table) throw new Error('Invalid category')

    const offset = (page - 1) * limit
    const conditions = [eq(table.isActive, true)]

    if (type) {
        conditions.push(eq(table.type, type as any))
    }

    if (difficulty && difficulty !== 'all') {
        conditions.push(eq(table.difficulty, difficulty as any))
    }

    // TODO: Filter by status (requires joining with attempts)
    // For now, we just return questions

    const data = await db
        .select()
        .from(table)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(table.createdAt))

    // Get total count for pagination
    const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(table)
        .where(and(...conditions))

    return {
        data,
        total: Number(countResult.count),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult.count) / limit),
    }
}

export async function getQuestionById({
    id,
    category,
}: {
    id: string
    category: 'speaking' | 'writing' | 'reading' | 'listening'
}) {
    const table = TABLE_MAP[category]
    if (!table) throw new Error('Invalid category')

    const [question] = await db
        .select()
        .from(table)
        .where(eq(table.id, id))
        .limit(1)

    return question
}

// ----------------------------------------------------------------------
// Submit Attempt
// ----------------------------------------------------------------------

export async function submitAttempt({
    category,
    questionId,
    data,
}: {
    category: 'speaking' | 'writing' | 'reading' | 'listening'
    questionId: string
    data: any
}) {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    const table = ATTEMPT_MAP[category]
    if (!table) throw new Error('Invalid category')

    // Import dynamically to avoid circular dependencies
    const { scoreWithOrchestrator } = await import('@/lib/ai/orchestrator')
    const { TestSection } = await import('@/lib/pte/types')

    let scoringResult
    try {
        // Map category to TestSection
        const sectionMap: Record<string, any> = {
            speaking: TestSection.SPEAKING,
            writing: TestSection.WRITING,
            reading: TestSection.READING,
            listening: TestSection.LISTENING,
        }

        const section = sectionMap[category]
        if (!section) throw new Error(`Invalid category: ${category}`)

        // Build payload based on category
        let payload: any = {}
        let questionType = data.type || 'unknown'

        if (category === 'speaking') {
            payload = {
                transcript: data.transcript || '',
                audioUrl: data.audioUrl || '',
                referenceText: data.referenceText,
            }
        } else if (category === 'writing') {
            payload = {
                text: data.userResponse || data.text || '',
                prompt: data.prompt || data.promptText,
            }
        } else if (category === 'reading') {
            payload = {
                selectedOption: data.selectedOption,
                selectedOptions: data.selectedOptions,
                correctOption: data.correctOption,
                correctOptions: data.correctOptions,
                answers: data.answers,
                correct: data.correct,
                order: data.order,
                userOrder: data.userOrder,
                correctOrder: data.correctOrder,
            }
        } else if (category === 'listening') {
            payload = {
                targetText: data.targetText,
                userText: data.userText || data.userResponse,
                transcript: data.transcript,
            }
        }

        // Call the orchestrator with a rationale
        scoringResult = await scoreWithOrchestrator({
            section,
            questionType,
            payload,
            includeRationale: true,
            timeoutMs: 10000,
        })
    } catch (error) {
        console.error('AI Scoring failed, using fallback:', error)
        // Fallback to zero score on error
        scoringResult = {
            overall: 0,
            subscores: {},
            rationale: 'Scoring failed. Please try again.',
        }
    }

    const attemptData = {
        userId: user.id,
        questionId,
        ...data,
        scores: scoringResult, // Store full scoring result
        createdAt: new Date(),
    }

    await db.insert(table).values(attemptData)

    revalidatePath(`/pte/practice/${category}`)
    return {
        success: true,
        score: scoringResult.overall,
        subscores: scoringResult.subscores,
        rationale: scoringResult.rationale,
    }
}
