import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Eraser } from 'lucide-react'

export default async function HighlightIncorrectWordsQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="highlight_incorrect_words"
      title="Highlight Incorrect Words"
      description="Practice identifying and clicking on words that are different from the audio recording."
      icon={Eraser}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('highlight_incorrect_words')}
      getStats={() => getListeningQuestionTypeStats('highlight_incorrect_words')}
    />
  )
}