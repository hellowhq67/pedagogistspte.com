import { headers } from 'next/headers'
import { fetchQuestionsServer } from './queries'

type Section = 'speaking' | 'reading' | 'writing' | 'listening'

interface SearchParams {
  page?: string
  pageSize?: string
  difficulty?: string
}

/**
 * Fetch questions for a listing page (server-side)
 */
export async function fetchListingQuestions(
  section: Section,
  questionType: string,
  searchParams?: SearchParams
) {
  const page = parseInt(searchParams?.page || '1', 10)
  const pageSize = parseInt(searchParams?.pageSize || '100', 10)
  const difficulty = searchParams?.difficulty

  const h = await headers()

  return await fetchQuestionsServer(section, questionType, h, {
    page,
    pageSize,
    difficulty,
  })
}

/**
 * Helper to get current month name
 */
export function getCurrentMonthName(): string {
  return new Date().toLocaleString('default', { month: 'long' })
}

/**
 * Helper to get current month key (lowercase)
 */
export function getCurrentMonthKey(): string {
  return getCurrentMonthName().toLowerCase()
}

/**
 * Filter questions by tag categories with fallback to all questions
 */
export function categorizeQuestions(questions: any[]) {
  const monthKey = getCurrentMonthKey()

  const weekly = questions.filter(
    (q: any) => Array.isArray(q.tags) && q.tags.includes('weekly_prediction')
  )

  const monthly = questions.filter(
    (q: any) =>
      Array.isArray(q.tags) &&
      (q.tags.includes(`prediction_${monthKey}`) ||
        q.tags.includes('monthly_prediction'))
  )

  return {
    all: questions,
    weekly: weekly.length > 0 ? weekly : questions,
    monthly: monthly.length > 0 ? monthly : questions,
  }
}
