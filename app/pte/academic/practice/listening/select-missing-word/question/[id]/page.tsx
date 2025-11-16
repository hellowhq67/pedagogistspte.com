import ListeningQuestionClient from '@/components/pte/listening/ListeningQuestionClient'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'

type Props = { params: Promise<{ id: string }> }

// Don't prerender any question pages at build time
export async function generateStaticParams() {
  return []
}

export default async function SelectMissingWordQuestionPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="listening" showFilters={false} />
        <div className="mt-8">
          <ListeningQuestionClient
            questionId={id}
            questionType="select_missing_word"
          />
        </div>
      </div>
    </div>
  )
}
