import ListeningQuestionClient from '@/components/pte/listening/ListeningQuestionClient'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'

type Props = { params: Promise<{ id: string }> }

export default async function HighlightIncorrectWordsQuestionPage({
  params,
}: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="listening" showFilters={false} />
        <div className="mt-8">
          <ListeningQuestionClient
            questionId={id}
            questionType="highlight_incorrect_words"
          />
        </div>
      </div>
    </div>
  )
}
