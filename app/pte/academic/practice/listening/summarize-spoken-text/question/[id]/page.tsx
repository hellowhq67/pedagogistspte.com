import ListeningAttempt from '@/components/pte/attempt/ListeningAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SummarizeSpokenTextQuestionPage({
  params,
}: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="listening" showFilters={false} />
        <div className="mt-8">
          <ListeningAttempt
            questionId={id}
            questionType="summarize_spoken_text"
          />
        </div>
      </div>
    </div>
  )
}
