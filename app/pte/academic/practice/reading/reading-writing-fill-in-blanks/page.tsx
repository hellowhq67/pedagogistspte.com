import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getReadingQuestionsWithStats,
  getReadingQuestionTypeStats,
}
from '@/lib/pte/queries-enhanced'
import { Textarea } from 'lucide-react'

export default async function ReadingWritingFillInBlanksPage() {
  return (
    <UniversalQuestionListPage
      module="reading"
      questionType="reading_writing_fill_in_blanks"
      title="Reading & Writing: Fill in the Blanks"
      description="Read the text and choose the best option to complete each blank."
      icon={Textarea}
      basePath="/pte/academic/practice/reading"
      getQuestions={() =>
        getReadingQuestionsWithStats('reading_writing_fill_in_blanks')
      }
      getStats={() =>
        getReadingQuestionTypeStats('reading_writing_fill_in_blanks')
      }
    />
  )
}
