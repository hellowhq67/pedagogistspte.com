import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { HelpCircle } from 'lucide-react'

export default async function AnswerShortQuestionQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="answer_short_question"
      title="Answer Short Question"
      description="Practice answering short questions with concise and accurate responses."
      icon={HelpCircle}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('answer_short_question')}
      getStats={() => getSpeakingQuestionTypeStats('answer_short_question')}
    />
  )
}