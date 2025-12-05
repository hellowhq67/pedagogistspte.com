import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import WriteFromDictationPracticeArea from './write-from-dictation-practice-area'

interface WriteFromDictationQuestionPageProps {
  params: { id: string }
}

export default async function WriteFromDictationQuestionPage({
  params,
}: WriteFromDictationQuestionPageProps) {
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

  const writeFromDictationInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a sentence. Listen carefully and type the exact sentence you hear into the textbox.',
    tips: [
      'Listen to the sentence multiple times to catch all words and their order.',
      'Pay attention to capitalization and punctuation.',
      'If you miss a word, try to guess based on context rather than leaving a blank.',
      'Review your typed sentence against what you heard before submitting.',
      'Accuracy in spelling and grammar is crucial.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Words',
        description:
          'You get one point for each correctly typed, spelled, and ordered word.',
        maxScore: 1, // Per word
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 10, // Example: 10 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="write-from-dictation"
      question={question}
      instructions={writeFromDictationInstructions}
    >
      <WriteFromDictationPracticeArea questionId={question.id} audioUrl={question.audioUrl} />
    </UniversalQuestionPage>
  )
}