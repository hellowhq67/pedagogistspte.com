import ListeningQuestionClient from '@/components/pte/listening/ListeningQuestionClient'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'

type Props = { params: { id: string } }

export default function FillInBlanksQuestionPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="listening" showFilters={false} />
        <div className="mt-8">
          <ListeningQuestionClient
            questionId={params.id}
            questionType="fill_in_blanks"
          />
        </div>
      </div>
    </div>
  )
}
