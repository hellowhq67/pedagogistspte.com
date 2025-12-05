import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import SummarizeGroupDiscussionPracticeArea from './summarize-group-discussion-practice-area'

interface SummarizeGroupDiscussionQuestionPageProps {
  params: { id: string }
}

export default async function SummarizeGroupDiscussionQuestionPage({
  params,
}: SummarizeGroupDiscussionQuestionPageProps) {
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

  const summarizeGroupDiscussionInstructions: QuestionInstructions = {
    taskDescription:
      'You will hear a recording of a group discussion. You need to summarize the main points and key conclusions of the discussion in your own words, within the given time.',
    tips: [
      'Listen carefully to identify the main topic and different viewpoints presented.',
      'Take notes of key arguments, agreements, disagreements, and resolutions.',
      'Structure your summary logically, starting with an introduction to the topic and then outlining the main points.',
      'Use transition words and phrases to ensure coherence and cohesion.',
      'Focus on accurately representing the discussion without adding personal opinions.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Accuracy and completeness of the summary, covering all main points.',
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
    prepTime: 10, // 10 seconds for preparation after discussion ends
    responseTime: 60, // 60 seconds to respond
  }

  return (
    <UniversalQuestionPage
      module="speaking"
      questionType="summarize-group-discussion"
      question={question}
      instructions={summarizeGroupDiscussionInstructions}
    >
      <SummarizeGroupDiscussionPracticeArea questionId={question.id} audioUrl={question.audioUrl} />
    </UniversalQuestionPage>
  )
}