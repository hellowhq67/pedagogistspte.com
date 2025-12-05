import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getReadingQuestionsWithStats,
  getReadingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { CheckSquare } from 'lucide-react'

export default async function MultipleChoiceMultipleQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="reading"
      questionType="multiple_choice_multiple"
      title="Multiple Choice, Multiple Answers"
      description="Practice reading a text and choosing all correct answers from multiple options."
      icon={CheckSquare}
      basePath="/pte/academic/practice/reading"
      getQuestions={() => getReadingQuestionsWithStats('multiple_choice_multiple')}
      getStats={() => getReadingQuestionTypeStats('multiple_choice_multiple')}
    />
  )
}