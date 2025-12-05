import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getListeningQuestionsWithStats,
  getListeningQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Headphones } from 'lucide-react' // Using headphones icon for listening

export default async function ListeningFillInBlanksQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="listening"
      questionType="fill_in_blanks"
      title="Fill in the Blanks (Listening)"
      description="Practice listening to a recording and typing the missing words into the blanks."
      icon={Headphones}
      basePath="/pte/academic/practice/listening"
      getQuestions={() => getListeningQuestionsWithStats('fill_in_blanks')}
      getStats={() => getListeningQuestionTypeStats('fill_in_blanks')}
    />
  )
}