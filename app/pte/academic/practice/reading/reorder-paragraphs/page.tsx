import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getReadingQuestionsWithStats,
  getReadingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { ListOrdered } from 'lucide-react'

export default async function ReorderParagraphsQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="reading"
      questionType="reorder_paragraphs"
      title="Reorder Paragraphs"
      description="Practice restoring jumbled paragraphs to their original, coherent order."
      icon={ListOrdered}
      basePath="/pte/academic/practice/reading"
      getQuestions={() => getReadingQuestionsWithStats('reorder_paragraphs')}
      getStats={() => getReadingQuestionTypeStats('reorder_paragraphs')}
    />
  )
}