import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getReadingQuestionsWithStats,
  getReadingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { TextCursorInput } from 'lucide-react'

export default async function ReadingFillInBlanksQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="reading"
      questionType="fill_in_blanks"
      title="Fill in the Blanks (Reading)"
      description="Practice completing a text by selecting the correct words from a given list."
      icon={TextCursorInput}
      basePath="/pte/academic/practice/reading"
      getQuestions={() => getReadingQuestionsWithStats('fill_in_blanks')}
      getStats={() => getReadingQuestionTypeStats('fill_in_blanks')}
    />
  )
}