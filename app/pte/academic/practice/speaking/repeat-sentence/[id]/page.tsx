import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import RepeatSentencePracticeArea from './repeat-sentence-practice-area'

interface RepeatSentenceQuestionPageProps {
  params: { id: string }
}

export default async function RepeatSentenceQuestionPage({
  params,
}: RepeatSentenceQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: speakingQuestions,
    attemptsTable: speakingAttempts,
    questionId: id,
    scoreField: 'overallScore',
  })

  if (!question) {
    notFound()
  }

  const repeatSentenceInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a sentence. You need to repeat the sentence exactly as you heard it, using the same pronunciation and intonation.',
    tips: [
      'Listen carefully to the entire sentence before starting to speak.',
      'Focus on intonation and rhythm; try to mimic the speaker.',
      'Pronounce each word clearly and accurately.',
      'Do not pause for too long; maintain fluency.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Accuracy of the words, including omissions and insertions.',
        maxScore: 5,
      },
      {
        name: 'Pronunciation',
        description: 'Vowel and consonant sounds, word stress, and rhythm.',
        maxScore: 5,
      },
      {
        name: 'Oral Fluency',
        description:
          'Rhythm, phrasing, and naturalness of the spoken language.',
        maxScore: 5,
      },
    ],
    prepTime: 3, // Minimal prep time as it's immediate
    responseTime: 10, // Max 10 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="repeat-sentence"
      question={question}
      instructions={repeatSentenceInstructions}
    >
      <RepeatSentencePracticeArea questionId={question.id} />
    </UniversalQuestionPage>
  )
}