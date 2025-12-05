import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import HighlightCorrectSummaryPracticeArea from './highlight-correct-summary-practice-area'

interface HighlightCorrectSummaryQuestionPageProps {
  params: { id: string }
}

export default async function HighlightCorrectSummaryQuestionPage({
  params,
}: HighlightCorrectSummaryQuestionPageProps) {
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

  const highlightCorrectSummaryInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording. After listening, read the given summaries and select the one that best summarizes the recording.',
    tips: [
      'Listen for the main idea and key supporting details of the audio.',
      'Read all the summary options carefully before making a choice.',
      'Eliminate summaries that contain incorrect information, miss key points, or include irrelevant details.',
      'The best summary will be concise, accurate, and cover the main message of the recording.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Summary',
        description: 'You get one point for selecting the correct summary.',
        maxScore: 1,
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 20, // Example: 20 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="highlight-correct-summary"
      question={question}
      instructions={highlightCorrectSummaryInstructions}
    >
      <HighlightCorrectSummaryPracticeArea questionId={question.id} audioUrl={question.audioUrl} options={question.options} />
    </UniversalQuestionPage>
  )
}