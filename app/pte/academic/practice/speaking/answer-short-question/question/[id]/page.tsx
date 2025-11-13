import type { Metadata } from 'next'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import SpeakingQuestionClient from '@/components/pte/speaking/SpeakingQuestionClient'
import { getSpeakingQuestionById } from '@/lib/pte/queries'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const question = await getSpeakingQuestionById(id)

  if (!question) {
    return {
      title: 'Answer Short Question Practice | PTE Academic',
    }
  }

  const label = (question as any).questionNumber ?? id

  return {
    title: `Answer Short Question Practice - Question ${label} | PTE Academic`,
    description: `Practice Answer Short Question question ${label} for PTE Academic Speaking section`,
  }
}

export default async function AnswerShortQuestionQuestionPage({
  params,
}: Props) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <AcademicPracticeHeader section="speaking" showFilters={false} />
      <SpeakingQuestionClient
        questionId={id}
        questionType="answer_short_question"
      />
    </div>
  )
}
