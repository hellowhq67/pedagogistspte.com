import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import SummarizeSpokenTextPracticeArea from './summarize-spoken-text-practice-area'

interface SummarizeSpokenTextQuestionPageProps {
  params: { id: string }
}

export default async function SummarizeSpokenTextQuestionPage({
  params,
}: SummarizeSpokenTextQuestionPageProps) {
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

  const summarizeSpokenTextInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a short lecture. Summarize the main idea and key supporting points in 50-70 words.',
    tips: [
      'Listen for the main idea and important details. Take concise notes as you listen.',
      'Organize your notes into a coherent summary after the lecture finishes.',
      'Ensure your summary is between 50 and 70 words. Adjust if necessary.',
      'Use grammatically correct sentences and appropriate vocabulary.',
      'Focus on capturing only the essential information from the lecture.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Covers all main points and relevant aspects of the lecture.',
        maxScore: 2,
      },
      {
        name: 'Form',
        description: 'Summary is between 50-70 words and is a single, continuous paragraph.',
        maxScore: 2,
      },
      {
        name: 'Grammar',
        description: 'Correct grammatical range and accuracy.',
        maxScore: 2,
      },
      {
        name: 'Vocabulary',
        description: 'Appropriate choice of words and lexical range.',
        maxScore: 2,
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 10 * 60, // 10 minutes to respond
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="summarize-spoken-text"
      question={question}
      instructions={summarizeSpokenTextInstructions}
    >
      <SummarizeSpokenTextPracticeArea questionId={question.id} audioUrl={question.audioUrl} />
    </UniversalQuestionPage>
  )
}