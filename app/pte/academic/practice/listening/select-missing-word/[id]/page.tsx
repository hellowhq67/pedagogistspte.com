import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import SelectMissingWordPracticeArea from './select-missing-word-practice-area'

interface SelectMissingWordQuestionPageProps {
  params: { id: string }
}

export default async function SelectMissingWordQuestionPage({
  params,
}: SelectMissingWordQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: listeningQuestions,
    attemptsTable: listeningAttempts,
    questionId: id,
    scoreField: 'accuracy',
  })

  if (!question) {
    notFound()
  }

  const selectMissingWordInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording with the last word or phrase replaced by a beep. From the given options, select the word or phrase that correctly completes the recording.',
    tips: [
      'Listen carefully to the entire recording and understand the context.',
      'Pay close attention to the grammar and meaning leading up to the beep.',
      'Consider which option logically and grammatically completes the sentence.',
      'Do not rush; sometimes more than one option may sound plausible initially.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Word',
        description: 'You get one point for selecting the correct missing word.',
        maxScore: 1,
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 10, // Example: 10 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="select-missing-word"
      question={question}
      instructions={selectMissingWordInstructions}
    >
      <SelectMissingWordPracticeArea questionId={question.id} audioUrl={question.audioUrl} options={question.options} />
    </UniversalQuestionPage>
  )
}