import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { CheckSquare } from 'lucide-react'

export default async function ListeningMultipleChoiceMultipleQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="multiple_choice_multiple"
      title="Multiple Choice, Multiple Answers (Listening)"
      description="Practice listening to a recording and choosing all correct answers from multiple options."
      icon={CheckSquare}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('multiple_choice_multiple')}
      getStats={() => getListeningQuestionTypeStats('multiple_choice_multiple')}
    />
  )
}