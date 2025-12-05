import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import RespondToASituationPracticeArea from './respond-to-a-situation-practice-area'

interface RespondToASituationQuestionPageProps {
  params: { id: string }
}

export default async function RespondToASituationQuestionPage({
  params,
}: RespondToASituationQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: speakingQuestions,
    attemptsTable: speakingAttempts,
    questionId: id,
    scoreField: 'overallScore',
  })

  if (!question) {
    notFound()
  }

  const respondToASituationInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a description of a situation. You need to respond to it as if you were in that situation, demonstrating appropriate language and communication skills.',
    tips: [
      'Listen carefully to understand the context and required role.',
      'Plan your response quickly, considering who you are speaking to and the purpose of the interaction.',
      'Use appropriate tone, vocabulary, and grammar for the given situation.',
      'Ensure your response is coherent, fluent, and well-pronounced.',
      'Practice common phrases for different social functions (e.g., apologizing, asking for clarification, agreeing).',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Relevance and appropriateness of the response to the situation.',
        maxScore: 5,
      },
      {
        name: 'Pronunciation',
        description: 'Vowel and consonant sounds, word stress, and rhythm.',
        maxScore: 5,
      },
      {
        name: 'Oral Fluency',
        description:
          'Rhythm, phrasing, and naturalness of the spoken language.',
        maxScore: 5,
      },
    ],
    prepTime: 10, // 10 seconds for preparation after hearing the situation
    responseTime: 20, // 20 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="respond-to-a-situation"
      question={question}
      instructions={respondToASituationInstructions}
    >
      <RespondToASituationPracticeArea questionId={question.id} audioUrl={question.audioUrl} />
    </UniversalQuestionPage>
  )
}