import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ListeningFillInBlanksPracticeArea from './fill-in-blanks-practice-area'

interface ListeningFillInBlanksQuestionPageProps {
  params: { id: string }
}

export default async function ListeningFillInBlanksQuestionPage({
  params,
}: ListeningFillInBlanksQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: listeningQuestions,
    attemptsTable: listeningAttempts,
    questionId: id,
    scoreField: 'accuracy',
  })

  if (!question) {
    notFound()
  }

  const listeningFillInBlanksInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording. A transcript of the recording will appear on the screen with some words missing. Fill in the missing words by typing them into the blanks.',
    tips: [
      'Listen carefully to identify the missing words. Pay attention to grammar and spelling.',
      'Use the context of the sentence to predict what words might fit.',
      'Listen multiple times if allowed, focusing on one blank at a time.',
      'Ensure your spelling is accurate, as even minor errors can lead to incorrect answers.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Words',
        description: 'You get one point for each correctly typed word.',
        maxScore: 1, // Per blank
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 30, // Example: 30 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="fill-in-blanks"
      question={question}
      instructions={listeningFillInBlanksInstructions}
    >
      <ListeningFillInBlanksPracticeArea questionId={question.id} audioUrl={question.audioUrl} options={question.options} />
    </UniversalQuestionPage>
  )
}