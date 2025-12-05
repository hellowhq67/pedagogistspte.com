import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Users } from 'lucide-react' // Using Users icon for group discussion

export default async function SummarizeGroupDiscussionQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="summarize_group_discussion"
      title="Summarize Group Discussion"
      description="Practice summarizing the main points of a group discussion accurately and concisely."
      icon={Users}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('summarize_group_discussion')}
      getStats={() => getSpeakingQuestionTypeStats('summarize_group_discussion')}
    />
  )
}