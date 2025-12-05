import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { readingQuestions, readingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ReadingFillInBlanksPracticeArea from './fill-in-blanks-practice-area'

interface ReadingFillInBlanksQuestionPageProps {
  params: { id: string }
}

export default async function ReadingFillInBlanksQuestionPage({
  params,
}: ReadingFillInBlanksQuestionPageProps) {
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

  const readingFillInBlanksInstructions: QuestionInstructions = {
    taskDescription:
      'Read the text with missing words. From the given list of words, select the best word to fill each blank to complete the text meaningfully and grammatically.',
    tips: [
      'Read the entire passage once to understand the general meaning.',
      'Identify the type of word needed for each blank (e.g., noun, verb, adjective, adverb).',
      'Look for grammatical clues and collocations.',
      'Consider the context and meaning to choose the most appropriate word.',
      'After filling all blanks, read the complete text to ensure it makes sense.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Blanks',
        description: 'You get one point for each correctly filled blank.',
        maxScore: 1, // Per blank
      },
    ],
    prepTime: 0, // No specific prep time, integrated with reading
    responseTime: 90, // Example: 90 seconds for longer texts
  }

  return (
    <UniversalQuestionPage
      module="reading"
      questionType="fill-in-blanks"
      question={question}
      instructions={readingFillInBlanksInstructions}
    >
      <ReadingFillInBlanksPracticeArea questionId={question.id} options={question.options} />
    </UniversalQuestionPage>
  )
}