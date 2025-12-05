import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { readingQuestions, readingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ReadingWritingFillBlanksPracticeArea from './reading-writing-fill-blanks-practice-area'

interface ReadingWritingFillBlanksQuestionPageProps {
  params: { id: string }
}

export default async function ReadingWritingFillBlanksQuestionPage({
  params,
}: ReadingWritingFillBlanksQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: readingQuestions,
    attemptsTable: readingAttempts,
    questionId: id,
    scoreField: 'accuracy',
  })

  if (!question) {
    notFound()
  }

  const readingWritingFillBlanksInstructions: QuestionInstructions = {
    taskDescription:
      'Read the text with missing words. Drag and drop the words from the box below the text into the correct blanks to complete the text meaningfully and grammatically.',
    tips: [
      'Read the entire passage once to get the main idea.',
      'Identify the grammatical role of the missing word (e.g., noun, verb, adjective).',
      'Look for clues in the surrounding words and sentences.',
      'Consider collocations and phrases.',
      'After placing all words, read the completed text to ensure coherence and correctness.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Blanks',
        description: 'You get one point for each correctly placed word.',
        maxScore: 1, // Per blank
      },
    ],
    prepTime: 0, // No specific prep time, integrated with reading
    responseTime: 120, // Example: 120 seconds for longer texts
  }

  return (
    <UniversalQuestionPage
      module="reading"
      questionType="reading_writing_fill_blanks"
      question={question}
      instructions={readingWritingFillBlanksInstructions}
    >
      <ReadingWritingFillBlanksPracticeArea questionId={question.id} options={question.options} />
    </UniversalQuestionPage>
  )
}