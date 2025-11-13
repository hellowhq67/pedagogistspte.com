import ReadingAttempt from '@/components/pte/attempt/ReadingAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FillInBlanksQuestionPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="reading" showFilters={false} />
        <div className="mt-8">
          <ReadingAttempt questionId={id} questionType="fill_in_blanks" />
        </div>
      </div>
    </div>
  )
}
