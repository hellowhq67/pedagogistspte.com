import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getWritingQuestionsWithStats,
  getWritingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { FileText } from 'lucide-react'

export default async function SummarizeWrittenTextQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="writing"
      questionType="summarize_written_text"
      title="Summarize Written Text"
      description="Practice summarizing a given text in a single sentence, maintaining its main idea."
      icon={FileText}
      basePath="/pte/academic/practice/writing"
      getQuestions={() => getWritingQuestionsWithStats('summarize_written_text')}
      getStats={() => getWritingQuestionTypeStats('summarize_written_text')}
    />
  )
}