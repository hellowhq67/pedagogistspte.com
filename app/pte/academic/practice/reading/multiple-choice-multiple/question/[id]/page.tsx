import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'

type Props = {
  params: Promise<{ id: string }>
}

// Don't prerender any question pages at build time
export async function generateStaticParams() {
  return []
}

export default async function MultipleChoiceMultipleQuestionPage({
  params,
}: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="reading" showFilters={false} />
        <div className="mt-8">
          <ReadingQuestionClient
            questionId={id}
            questionType="multiple_choice_multiple"
          />
        </div>
      </div>
    </div>
  )
}
