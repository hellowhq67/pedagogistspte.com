import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import DescribeImagePracticeArea from './describe-image-practice-area'

interface DescribeImageQuestionPageProps {
  params: { id: string }
}

export default async function DescribeImageQuestionPage({
  params,
}: DescribeImageQuestionPageProps) {
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

  const describeImageInstructions: QuestionInstructions = {
    taskDescription:
      'You will see an image. Describe the image in detail, focusing on key features, relationships, and implications, as if explaining it to someone who cannot see it.',
    tips: [
      'Identify the main subject and overall theme of the image first.',
      'Describe the image systematically, e.g., from left to right, top to bottom, or general to specific.',
      'Use a variety of vocabulary related to colors, shapes, positions, and actions.',
      'Conclude with a summary or implication if appropriate.',
      'Ensure clear pronunciation and fluent delivery.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Clarity and coherence of the description, coverage of key aspects.',
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
    prepTime: 25, // 25 seconds for preparation
    responseTime: 40, // 40 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="describe-image"
      question={question}
      instructions={describeImageInstructions}
    >
      <DescribeImagePracticeArea questionId={question.id} imageUrl={question.promptMediaUrl} />
    </UniversalQuestionPage>
  )
}