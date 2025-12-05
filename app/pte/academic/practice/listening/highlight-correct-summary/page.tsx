import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Highlighter } from 'lucide-react'

export default async function HighlightCorrectSummaryQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="highlight_correct_summary"
      title="Highlight Correct Summary"
      description="Practice listening to a recording and choosing the option that best summarizes it."
      icon={Highlighter}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('highlight_correct_summary')}
      getStats={() => getListeningQuestionTypeStats('highlight_correct_summary')}
    />
  )
}