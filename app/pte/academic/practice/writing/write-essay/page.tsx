import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getWritingQuestionsWithStats,
  getWritingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Pencil } from 'lucide-react'

export default async function WriteEssayQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="writing"
      questionType="write_essay"
      title="Write Essay"
      description="Practice writing an essay on a given topic within a time limit."
      icon={Pencil}
      basePath="/pte/academic/practice/writing"
      getQuestions={() => getWritingQuestionsWithStats('write_essay')}
      getStats={() => getWritingQuestionTypeStats('write_essay')}
    />
  )
}