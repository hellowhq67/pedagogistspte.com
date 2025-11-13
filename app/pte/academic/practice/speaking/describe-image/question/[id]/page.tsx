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
      title: 'Describe Image Practice | PTE Academic',
    }
  }

  const label = (question as any).questionNumber ?? id

  return {
    title: `Describe Image Practice - Question ${label} | PTE Academic`,
    description: `Practice Describe Image question ${label} for PTE Academic Speaking section`,
  }
}

export default async function DescribeImageQuestionPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <AcademicPracticeHeader section="speaking" showFilters={false} />
      <SpeakingQuestionClient questionId={id} questionType="describe_image" />
    </div>
  )
}
