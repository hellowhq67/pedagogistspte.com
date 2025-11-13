import type { Metadata } from 'next'
import SpeakingAttempt from '@/components/pte/attempt/SpeakingAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { getSpeakingQuestionById } from '@/lib/pte/queries'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const question = await getSpeakingQuestionById(id)

  if (!question) {
    return {
      title: 'Repeat Sentence Practice | PTE Academic',
    }
  }

  const label = (question as any).questionNumber ?? id

  return {
    title: `Repeat Sentence Practice - Question ${label} | PTE Academic`,
    description: `Practice Repeat Sentence question ${label} for PTE Academic Speaking section`,
  }
}

export default async function RepeatSentenceQuestionPage({ params }: Props) {
  const { id } = await params
  const q = await getSpeakingQuestionById(id)

  return (
    <div className="container mx-auto py-6">
      <AcademicPracticeHeader section="speaking" showFilters={false} />
      <div className="mt-6">
        <SpeakingAttempt
          questionId={id}
          questionType="repeat_sentence"
          prompt={
            q
              ? {
                  title: q.title ?? undefined,
                  promptText: (q as any).promptText ?? undefined,
                  promptMediaUrl: (q as any).promptMediaUrl ?? undefined,
                  difficulty: (q as any).difficulty ?? undefined,
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
