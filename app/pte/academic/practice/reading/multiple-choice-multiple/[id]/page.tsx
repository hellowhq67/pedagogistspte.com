import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { readingQuestions, readingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import MultipleChoiceMultiplePracticeArea from './multiple-choice-multiple-practice-area'

interface MultipleChoiceMultipleQuestionPageProps {
  params: { id: string }
}

export default async function MultipleChoiceMultipleQuestionPage({
  params,
}: MultipleChoiceMultipleQuestionPageProps) {
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

  const multipleChoiceMultipleInstructions: QuestionInstructions = {
    taskDescription:
      'Read the text and then answer the multiple-choice question by selecting ALL correct options. There may be more than one correct answer.',
    tips: [
      'Read the question carefully to understand what is being asked.',
      'Scan the text to identify sections related to the question.',
      'Evaluate each option independently against the information in the text.',
      'Do not assume; every correct answer must be explicitly supported by the text.',
      'Partial credit is usually not awarded; you must select all correct options.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Answers',
        description:
          'You get points for each correct option selected and lose points for incorrect options selected.',
        maxScore: 2, // Example, depends on number of correct options
      },
    ],
    prepTime: 0, // No specific prep time, integrated with reading
    responseTime: 40, // Example: 40 seconds per question
  }

  return (
    <UniversalQuestionPage
      module="reading"
      questionType="multiple-choice-multiple"
      question={question}
      instructions={multipleChoiceMultipleInstructions}
    >
      <MultipleChoiceMultiplePracticeArea questionId={question.id} options={question.options} />
    </UniversalQuestionPage>
  )
}