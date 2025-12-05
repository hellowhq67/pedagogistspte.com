import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { MessageSquare } from 'lucide-react'

export default async function RespondToASituationQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="respond_to_a_situation"
      title="Respond to a Situation"
      description="Practice responding appropriately to various social or academic situations."
      icon={MessageSquare}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('respond_to_a_situation')}
      getStats={() => getSpeakingQuestionTypeStats('respond_to_a_situation')}
    />
  )
}