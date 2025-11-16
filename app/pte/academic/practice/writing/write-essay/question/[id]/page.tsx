import WritingAttempt from '@/components/pte/attempt/WritingAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'

type Props = {
  params: Promise<{ id: string }>
}

// Don't prerender any question pages at build time
export async function generateStaticParams() {
  return []
}

async function fetchWritingQuestion(id: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `http://localhost:${process.env.PORT || 3000}`
    const res = await fetch(
      `${baseUrl}/api/writing/questions/${encodeURIComponent(id)}`,
      {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.question || data
  } catch {
    return null
  }
}

export default async function WriteEssayQuestionPage({ params }: Props) {
  const { id } = await params
  const q = await fetchWritingQuestion(id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="writing" showFilters={false} />
        <div className="mt-8">
          <WritingAttempt
            questionId={id}
            questionType="write_essay"
            prompt={
              q
                ? {
                    title: q.title ?? undefined,
                    promptText: q.promptText ?? undefined,
                    difficulty: q.difficulty ?? undefined,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}
