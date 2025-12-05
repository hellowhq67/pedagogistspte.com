import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getReadingQuestionsWithStats,
  getReadingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { CheckCircle } from 'lucide-react'

export default async function MultipleChoiceSingleQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="reading"
      questionType="multiple_choice_single"
      title="Multiple Choice, Single Answer"
      description="Practice reading a text and choosing the single best answer from multiple options."
      icon={CheckCircle}
      basePath="/pte/academic/practice/reading"
      getQuestions={() => getReadingQuestionsWithStats('multiple_choice_single')}
      getStats={() => getReadingQuestionTypeStats('multiple_choice_single')}
    />
  )
}