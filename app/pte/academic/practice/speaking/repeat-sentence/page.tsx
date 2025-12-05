import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Volume2 } from 'lucide-react' // Using Volume2 as a generic speaking icon, similar to Mic

export default async function RepeatSentenceQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="repeat_sentence"
      title="Repeat Sentence"
      description="Practice listening to and repeating sentences accurately and fluently."
      icon={Volume2}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('repeat_sentence')}
      getStats={() => getSpeakingQuestionTypeStats('repeat_sentence')}
    />
  )
}