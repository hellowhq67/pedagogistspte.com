import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getReadingQuestionsWithStats,
  getReadingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { PencilRuler } from 'lucide-react'

export default async function ReadingWritingFillBlanksQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="reading" // This is still considered a reading question type in the enum
      questionType="reading_writing_fill_blanks"
      title="Reading & Writing: Fill in the Blanks"
      description="Practice completing a text by dragging and dropping words from a box into the correct blanks."
      icon={PencilRuler}
      basePath="/pte/academic/practice/reading"
      getQuestions={() => getReadingQuestionsWithStats('reading_writing_fill_blanks')}
      getStats={() => getReadingQuestionTypeStats('reading_writing_fill_blanks')}
    />
  )
}