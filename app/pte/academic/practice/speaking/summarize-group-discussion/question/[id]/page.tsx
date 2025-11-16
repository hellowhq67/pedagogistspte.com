import type { Metadata } from 'next'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import SpeakingQuestionClient from '@/components/pte/speaking/SpeakingQuestionClient'
import { getSpeakingQuestionById } from '@/lib/pte/queries'

type Props = {
  params: Promise<{ id: string }>
}

// Don't prerender any question pages at build time
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const question = await getSpeakingQuestionById(id)

  if (!question) {
    return {
      title: 'Summarize Group Discussion Practice | PTE Academic',
    }
  }

  const label = (question as any).questionNumber ?? id

  return {
    title: `Summarize Group Discussion Practice - Question ${label} | PTE Academic`,
    description: `Practice Summarize Group Discussion question ${label} for PTE Academic Speaking section`,
  }
}

export default async function SummarizeGroupDiscussionQuestionPage({
  params,
}: Props) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <AcademicPracticeHeader section="speaking" showFilters={false} />
      <SpeakingQuestionClient
        questionId={id}
        questionType="summarize_group_discussion"
      />
    </div>
  )
}
