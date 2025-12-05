import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { MinusCircle } from 'lucide-react'

export default async function SelectMissingWordQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="select_missing_word"
      title="Select Missing Word"
      description="Practice listening to a recording and choosing the word that best completes the final blank."
      icon={MinusCircle}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('select_missing_word')}
      getStats={() => getListeningQuestionTypeStats('select_missing_word')}
    />
  )
}