import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ListeningMultipleChoiceMultiplePracticeArea from './multiple-choice-multiple-practice-area'

interface ListeningMultipleChoiceMultipleQuestionPageProps {
  params: { id: string }
}

export default async function ListeningMultipleChoiceMultipleQuestionPage({
  params,
}: ListeningMultipleChoiceMultipleQuestionPageProps) {
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

  const listeningMultipleChoiceMultipleInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording. After listening, answer the multiple-choice question by selecting ALL correct options. There may be more than one correct answer.',
    tips: [
      'Listen carefully for multiple pieces of information that relate to the question.',
      'Take notes to capture all relevant details.',
      'Evaluate each option against the audio content. Do not select an option unless it is explicitly supported.',
      'Remember that there can be more than one correct answer, so consider all choices.',
      'Ensure you select all correct options to receive full marks; partial credit is usually not awarded.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Answers',
        description:
          'You get points for each correct option selected and lose points for incorrect options selected.',
        maxScore: 2, // Example, depends on number of correct options
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 30, // Example: 30 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="multiple-choice-multiple"
      question={question}
      instructions={listeningMultipleChoiceMultipleInstructions}
    >
      <ListeningMultipleChoiceMultiplePracticeArea questionId={question.id} audioUrl={question.audioUrl} options={question.options} />
    </UniversalQuestionPage>
  )
}