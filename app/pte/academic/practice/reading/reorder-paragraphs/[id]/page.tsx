import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { readingQuestions, readingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import ReorderParagraphsPracticeArea from './reorder-paragraphs-practice-area'

interface ReorderParagraphsQuestionPageProps {
  params: { id: string }
}

export default async function ReorderParagraphsQuestionPage({
  params,
}: ReorderParagraphsQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: readingQuestions,
    attemptsTable: readingAttempts,
    questionId: id,
    scoreField: 'accuracy',
  })

  if (!question) {
    notFound()
  }

  const reorderParagraphsInstructions: QuestionInstructions = {
    taskDescription:
      'You will be given several paragraphs in a jumbled order. You need to reorder them to form a coherent and grammatically correct text.',
    tips: [
      'Read all the sentences/paragraphs once to get a general idea of the topic.',
      'Look for the topic sentence, which usually introduces the main idea.',
      'Identify logical connections between sentences/paragraphs using transition words (e.g., "however", "therefore", "in addition"), pronouns, and repeated nouns.',
      'Check for chronological order, cause and effect relationships, or comparative structures.',
      'Read the reordered text to ensure it flows logically.',
    ],
    scoringCriteria: [
      {
        name: 'Correct Order',
        description: 'Points are awarded for each correctly placed adjacent pair of sentences.',
        maxScore: 3, // Example: Varies by number of paragraphs
      },
    ],
    prepTime: 0, // No specific prep time, integrated with reading
    responseTime: 90, // Example: 90 seconds for longer texts
  }

  return (
    <UniversalQuestionPage
      module="reading"
      questionType="reorder-paragraphs"
      question={question}
      instructions={reorderParagraphsInstructions}
    >
      <ReorderParagraphsPracticeArea questionId={question.id} options={question.options} />
    </UniversalQuestionPage>
  )
}