import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import RetellLecturePracticeArea from './retell-lecture-practice-area'

interface RetellLectureQuestionPageProps {
  params: { id: string }
}

export default async function RetellLectureQuestionPage({
  params,
}: RetellLectureQuestionPageProps) {
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

  const retellLectureInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a lecture. After the lecture finishes, you need to retell it in your own words, summarizing the main points and key information.',
    tips: [
      'Take notes while listening to capture key ideas, names, dates, and concepts.',
      'Organize your notes into a coherent structure before speaking.',
      'Start with a clear introduction, summarize main points, and provide a conclusion.',
      'Use signal words and phrases to connect ideas (e.g., "firstly," "furthermore," "in conclusion").',
      'Focus on content, fluency, and pronunciation.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Accuracy and completeness of the main points and details from the lecture.',
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
    prepTime: 10, // 10 seconds for preparation after lecture ends
    responseTime: 40, // 40 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="retell-lecture"
      question={question}
      instructions={retellLectureInstructions}
    >
      <RetellLecturePracticeArea questionId={question.id} audioUrl={question.audioUrl} imageUrl={question.promptMediaUrl} />
    </UniversalQuestionPage>
  )
}