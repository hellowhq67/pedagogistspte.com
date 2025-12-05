import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Mic } from 'lucide-react'

export default async function ReadAloudQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="read_aloud"
      title="Read Aloud"
      description="Practice reading text aloud with clear pronunciation and fluency"
      icon={Mic}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('read_aloud')}
      getStats={() => getSpeakingQuestionTypeStats('read_aloud')}
    />
  )
}