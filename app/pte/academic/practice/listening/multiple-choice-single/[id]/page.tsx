import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ListeningMultipleChoiceSinglePracticeArea from './multiple-choice-single-practice-area'

interface ListeningMultipleChoiceSingleQuestionPageProps {
  params: { id: string }
}

export default async function ListeningMultipleChoiceSingleQuestionPage({
  params,
}: ListeningMultipleChoiceSingleQuestionPageProps) {
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

  const listeningMultipleChoiceSingleInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording. After listening, answer the multiple-choice question by selecting the single correct option.',
    tips: [
      'Listen carefully for the main idea and specific details.',
      'Take brief notes if needed to remember key information.',
      'Read the question and options carefully before making your choice.',
      'Eliminate options that are clearly incorrect or not mentioned.',
      'Do not choose an answer based on assumptions; it must be supported by the audio.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Answer',
        description: 'You get one point for each correct answer.',
        maxScore: 1,
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 20, // Example: 20 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="multiple-choice-single"
      question={question}
      instructions={listeningMultipleChoiceSingleInstructions}
    >
      <ListeningMultipleChoiceSinglePracticeArea questionId={question.id} audioUrl={question.audioUrl} options={question.options} />
    </UniversalQuestionPage>
  )
}