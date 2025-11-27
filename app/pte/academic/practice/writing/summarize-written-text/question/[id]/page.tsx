import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'
import { db } from '@/lib/db'
import { writingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getQuestion(id: string) {
  try {
    const questions = await db
      .select()
      .from(writingQuestions)
      .where(eq(writingQuestions.id, id))
      .limit(1)

    return questions[0] || null
  } catch (error) {
    console.error('Error fetching summarize written text question:', error)
    return null
  }
}

export default async function SummarizeWrittenTextQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'summarize_written_text') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/writing/summarize-written-text"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Read the passage and summarize it in one sentence (5-75 words). Time limit: 10 minutes
        </p>
      </div>

      <div className="space-y-6">
        <WritingQuestionClient
          questionId={params.id}
          questionType="summarize_written_text"
        />
      </div>
    </div>
  )
}
