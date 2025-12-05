import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import AnswerShortQuestionPracticeArea from './answer-short-question-practice-area'

interface AnswerShortQuestionQuestionPageProps {
  params: { id: string }
}

export default async function AnswerShortQuestionQuestionPage({
  params,
}: AnswerShortQuestionQuestionPageProps) {
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

  const answerShortQuestionInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a question. You need to answer the question with a short, simple, and accurate response.',
    tips: [
      'Listen carefully to identify the core of the question.',
      'Provide a direct answer, usually one or a few words, without elaboration.',
      'Ensure your answer is grammatically correct and clearly pronounced.',
      'Focus on lexical resources and pronunciation.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Accuracy of the answer and relevance to the question.',
        maxScore: 5,
      },
      {
        name: 'Pronunciation',
        description: 'Clarity of individual sounds and word stress.',
        maxScore: 5,
      },
      {
        name: 'Oral Fluency',
        description: 'Smoothness and naturalness of the response.',
        maxScore: 5,
      },
    ],
    prepTime: 3, // Minimal prep time as it's immediate
    responseTime: 10, // Max 10 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="answer-short-question"
      question={question}
      instructions={answerShortQuestionInstructions}
    >
      <AnswerShortQuestionPracticeArea questionId={question.id} audioUrl={question.audioUrl} />
    </UniversalQuestionPage>
  )
}