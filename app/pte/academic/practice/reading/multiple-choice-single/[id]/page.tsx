import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { readingQuestions, readingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import MultipleChoiceSinglePracticeArea from './multiple-choice-single-practice-area'

interface MultipleChoiceSingleQuestionPageProps {
  params: { id: string }
}

export default async function MultipleChoiceSingleQuestionPage({
  params,
}: MultipleChoiceSingleQuestionPageProps) {
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

  const multipleChoiceSingleInstructions: QuestionInstructions = {
    taskDescription:
      'Read the text and then answer the multiple-choice question by selecting the single correct option.',
    tips: [
      'Read the question first to know what information to look for.',
      'Scan the text to locate the relevant section.',
      'Read the relevant section carefully, then evaluate each option.',
      'Eliminate obviously incorrect options.',
      'Choose the best answer that is directly supported by the text.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Answer',
        description: 'You get one point for each correct answer.',
        maxScore: 1,
      },
    ],
    prepTime: 0, // No specific prep time, integrated with reading
    responseTime: 30, // Example: 30 seconds per question
  }

  return (
    <UniversalQuestionPage
      module="reading"
      questionType="multiple-choice-single"
      question={question}
      instructions={multipleChoiceSingleInstructions}
    >
      <MultipleChoiceSinglePracticeArea questionId={question.id} options={question.options} />
    </UniversalQuestionPage>
  )
}