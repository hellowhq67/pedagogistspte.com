import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { writingQuestions, writingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import SummarizeWrittenTextPracticeArea from './summarize-written-text-practice-area'

interface SummarizeWrittenTextQuestionPageProps {
  params: { id: string }
}

export default async function SummarizeWrittenTextQuestionPage({
  params,
}: SummarizeWrittenTextQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: writingQuestions,
    attemptsTable: writingAttempts,
    questionId: id,
    scoreField: 'overallScore',
  })

  if (!question) {
    notFound()
  }

  const summarizeWrittenTextInstructions: QuestionInstructions = {
    taskDescription:
      'Read the given text and write a summary of 5-75 words, capturing the main idea and key points.',
    tips: [
      'Read the passage carefully to identify the main topic and supporting ideas.',
      'Highlight or make notes of the most important information.',
      'Draft your summary, aiming for one concise sentence or a short paragraph.',
      'Ensure your summary is grammatically correct and uses appropriate vocabulary.',
      'Check the word count (5-75 words) and revise if necessary.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Covers all relevant aspects of the summary.',
        maxScore: 2,
      },
      {
        name: 'Form',
        description: 'Within the word count (5-75 words) and presented as a single sentence.',
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
    prepTime: 0, // Integrated with reading
    responseTime: 10 * 60, // 10 minutes to respond
  }

  return (
    <UniversalQuestionPage
      module="writing"
      questionType="summarize-written-text"
      question={question}
      instructions={summarizeWrittenTextInstructions}
    >
      <SummarizeWrittenTextPracticeArea questionId={question.id} />
    </UniversalQuestionPage>
  )
}