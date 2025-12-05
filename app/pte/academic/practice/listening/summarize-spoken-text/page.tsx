import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Headphones } from 'lucide-react'

export default async function SummarizeSpokenTextQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="summarize_spoken_text"
      title="Summarize Spoken Text"
      description="Practice listening to a short lecture and writing a summary of its main points."
      icon={Headphones}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('summarize_spoken_text')}
      getStats={() => getListeningQuestionTypeStats('summarize_spoken_text')}
    />
  )
}