import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Type } from 'lucide-react'

export default async function WriteFromDictationQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="write_from_dictation"
      title="Write From Dictation"
      description="Practice listening to a sentence and typing it exactly as you hear it."
      icon={Type}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('write_from_dictation')}
      getStats={() => getListeningQuestionTypeStats('write_from_dictation')}
    />
  )
}