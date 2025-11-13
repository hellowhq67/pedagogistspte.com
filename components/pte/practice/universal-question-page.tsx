/**
 * Universal Question Page Template
 * Use this as a template for all practice question pages
 *
 * Usage:
 * 1. Copy this file to your question route
 * 2. Update SECTION, QUESTION_TYPE, and API_ENDPOINT constants
 * 3. Customize titles and descriptions as needed
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import QuestionInterface from '@/components/pte/practice/question-interface'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ==================== CONFIGURATION ====================
// Update these constants for each question type

const SECTION = 'speaking' // speaking, writing, reading, listening
const QUESTION_TYPE = 'read_aloud' // read_aloud, write_essay, etc.
const API_ENDPOINT = '/api/speaking/questions' // API endpoint for this section
const QUESTION_TITLE = 'Read Aloud' // Display name
const SECTION_TITLE = 'Speaking' // Section display name
const DESCRIPTION = 'Read the following text aloud as naturally as possible.'
const TIME_LIMIT = 40 // seconds

// =======================================================

type Params = {
  params: Promise<{ id: string }>
}

type Question = {
  id: string
  type?: string
  title?: string
  promptText?: string | null
  promptMediaUrl?: string | null
  difficulty?: string
  options?: any
  answerKey?: any
  correctAnswers?: any
  isActive?: boolean
  createdAt?: string
}

async function fetchQuestion(id: string): Promise<Question | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `http://localhost:${process.env.PORT || 3000}`
    const res = await fetch(`${baseUrl}${API_ENDPOINT}/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      console.error(`Failed to fetch question: ${res.status}`)
      return null
    }

    const data = await res.json()
    return data.question || data
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

async function QuestionContent({ id }: { id: string }) {
  const question = await fetchQuestion(id)

  if (!question) {
    notFound()
  }

  // Adapt question to QuestionInterface format
  const qiQuestion = {
    id: question.id,
    type: question.type || QUESTION_TYPE,
    title: question.title || `${QUESTION_TITLE} — Question ${id.slice(0, 8)}`,
    description: question.promptText || DESCRIPTION,
    timeLimit: TIME_LIMIT,
    audioUrl: question.promptMediaUrl,
    imageUrl: undefined,
    text: question.promptText || question.title || 'No content available.',
    options: question.options,
    correctAnswer: question.answerKey || question.correctAnswers,
  }

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {QUESTION_TITLE} Practice — Question {id.slice(0, 8)}
        </h1>
        {question.difficulty && (
          <p className="text-muted-foreground mt-1 text-sm">
            Difficulty:{' '}
            <span className="font-medium capitalize">
              {question.difficulty}
            </span>
          </p>
        )}
      </div>

      {/* Practice interface */}
      <QuestionInterface
        question={qiQuestion as any}
        onComplete={() => {
          // Submission handled in QuestionInterface
        }}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t pt-6">
        <Button asChild variant="outline">
          <Link href={`/pte/academic/practice/${SECTION}/${QUESTION_TYPE}`}>
            ← Back to List
          </Link>
        </Button>

        <Button asChild variant="outline">
          <Link
            href={`/pte/academic/practice/${SECTION}/${QUESTION_TYPE}/question/${id}`}
          >
            Redo
          </Link>
        </Button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export async function generateMetadata(props: Params) {
  const params = await props.params
  return {
    title: `${QUESTION_TITLE} Practice — PTE Academic`,
    description: `Practice PTE Academic ${QUESTION_TITLE} with AI scoring`,
  }
}

export default async function UniversalQuestionPage(props: Params) {
  const params = await props.params
  const id = params.id

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <AcademicPracticeHeader section={SECTION as any} showFilters={false} />

        {/* Breadcrumbs */}
        <nav className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
          <Link href="/pte" className="hover:text-primary">
            PTE
          </Link>
          <span>/</span>
          <Link href="/pte/academic/practice" className="hover:text-primary">
            Practice
          </Link>
          <span>/</span>
          <Link
            href={`/pte/academic/practice/${SECTION}`}
            className="hover:text-primary"
          >
            {SECTION_TITLE}
          </Link>
          <span>/</span>
          <Link
            href={`/pte/academic/practice/${SECTION}/${QUESTION_TYPE}`}
            className="hover:text-primary"
          >
            {QUESTION_TITLE}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            Question {id.slice(0, 8)}
          </span>
        </nav>

        {/* Content */}
        <div className="mt-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <QuestionContent id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
