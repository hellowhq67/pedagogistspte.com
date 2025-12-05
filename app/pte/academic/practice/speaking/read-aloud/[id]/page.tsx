import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import {
  getQuestionByIdWithStats,
  formatScoreByModule,
} from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ReadAloudPracticeArea from './read-aloud-practice-area' // We will create this next

interface ReadAloudQuestionPageProps {
  params: { id: string }
}

export default async function ReadAloudQuestionPage({
  params,
}: ReadAloudQuestionPageProps) {
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

  const readAloudInstructions: QuestionInstructions = {
    taskDescription:
      'You will see a text on the screen. You need to read the text aloud into the microphone. Speak clearly and at a natural pace.',
    tips: [
      'Read the text silently first to understand its meaning and identify difficult words.',
      'Maintain a consistent pace and clear pronunciation.',
      'Pay attention to intonation and stress for better fluency.',
      'Speak at a moderate volume; not too loud, not too soft.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Accuracy of the text read, omissions, and insertions.',
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
    prepTime: 35, // Example: 35 seconds for preparation
    responseTime: 40, // Example: 40 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="read-aloud"
      question={question}
      instructions={readAloudInstructions}
      // You would pass bookmark and skip handlers here if needed
      // onBookmarkToggle={handleBookmarkToggle}
      // onSkip={handleSkip}
    >
      {/* This is where the specific Read Aloud practice component will go */}
      <ReadAloudPracticeArea questionId={question.id} />
    </UniversalQuestionPage>
  )
}