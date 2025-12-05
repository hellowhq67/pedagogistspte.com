import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { CheckCircle } from 'lucide-react'

export default async function ListeningMultipleChoiceSingleQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="multiple_choice_single"
      title="Multiple Choice, Single Answer (Listening)"
      description="Practice listening to a recording and choosing the single best answer from multiple options."
      icon={CheckCircle}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('multiple_choice_single')}
      getStats={() => getListeningQuestionTypeStats('multiple_choice_single')}
    />
  )
}