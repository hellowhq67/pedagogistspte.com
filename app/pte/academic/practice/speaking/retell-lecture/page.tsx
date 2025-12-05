import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { BookOpen } from 'lucide-react'

export default async function RetellLectureQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="retell_lecture"
      title="Retell Lecture"
      description="Practice listening to a lecture and summarizing its main points in your own words."
      icon={BookOpen}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('retell_lecture')}
      getStats={() => getSpeakingQuestionTypeStats('retell_lecture')}
    />
  )
}