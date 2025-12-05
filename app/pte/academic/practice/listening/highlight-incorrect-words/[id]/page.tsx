import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { listeningQuestions, listeningAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import HighlightIncorrectWordsPracticeArea from './highlight-incorrect-words-practice-area'

interface HighlightIncorrectWordsQuestionPageProps {
  params: { id: string }
}

export default async function HighlightIncorrectWordsQuestionPage({
  params,
}: HighlightIncorrectWordsQuestionPageProps) {
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

  const highlightIncorrectWordsInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording of a text. A transcript of the text will also appear on the screen. While listening, identify and click on the words in the transcript that are different from what is said in the audio.',
    tips: [
      'Read the transcript quickly before the audio begins.',
      'Listen very carefully to the audio, comparing it with the text on the screen.',
      'Click on any word in the transcript that does not match the audio.',
      'Be careful not to click on correct words, as this will deduct points.',
      'This task requires strong attention to detail and ability to compare quickly.',
    ],
    scoringCriteria: [
      {
        name: 'Correctly Highlighted Words',
        description:
          'You get one point for each correctly identified incorrect word. Points are deducted for incorrect selections.',
        maxScore: 1, // Per incorrect word
      },
    ],
    prepTime: 0, // Integrated with listening time
    responseTime: 30, // Example: 30 seconds after audio
  }

  return (
    <UniversalQuestionPage
      module="listening"
      questionType="highlight-incorrect-words"
      question={question}
      instructions={highlightIncorrectWordsInstructions}
    >
      <HighlightIncorrectWordsPracticeArea questionId={question.id} audioUrl={question.audioUrl} transcript={question.promptText} />
    </UniversalQuestionPage>
  )
}