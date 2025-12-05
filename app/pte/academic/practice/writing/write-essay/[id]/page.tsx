import { notFound } from 'next/navigation'
import { UniversalQuestionPage } from '@/components/pte/universal-question-page'
import { getQuestionByIdWithStats } from '@/lib/pte/queries-enhanced'
import { writingQuestions, writingAttempts } from '@/lib/db/schema'
import { QuestionInstructions } from '@/lib/pte/types-enhanced'
import WriteEssayPracticeArea from './write-essay-practice-area'

interface WriteEssayQuestionPageProps {
  params: { id: string }
}

export default async function WriteEssayQuestionPage({
  params,
}: WriteEssayQuestionPageProps) {
  const { id } = params

  const question = await getQuestionByIdWithStats({
    questionTable: writingQuestions,
    attemptsTable: writingAttempts,
    questionId: id,
    scoreField: 'overallScore',
  })

  if (!question) {
    notFound()
  }

  const writeEssayInstructions: QuestionInstructions = {
    taskDescription:
      'You will be presented with a topic. Write an essay of 200-300 words, expressing your opinion or argument, and supporting it with examples.',
    tips: [
      'Understand the prompt fully and identify keywords.',
      'Brainstorm ideas and create an outline (introduction, body paragraphs, conclusion).',
      'Start with a clear thesis statement in the introduction.',
      'Develop each body paragraph with a topic sentence and supporting details/examples.',
      'Use transition words to ensure smooth flow between ideas and paragraphs.',
      'Maintain academic tone and appropriate vocabulary.',
      'Manage your time to allow for planning, writing, and reviewing.',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'Relevance to the prompt, development of arguments, and examples.',
        maxScore: 3,
      },
      {
        name: 'Form',
        description: 'Essay structure (introduction, body, conclusion) and word count (200-300 words).',
        maxScore: 3,
      },
      {
        name: 'Development, Structure, Coherence',
        description: 'Logical organization of ideas and smooth transitions.',
        maxScore: 3,
      },
      {
        name: 'Grammar',
        description: 'Accuracy and range of grammatical structures.',
        maxScore: 2,
      },
      {
        name: 'Vocabulary',
        description: 'Range and accuracy of vocabulary.',
        maxScore: 2,
      },
      {
        name: 'General Linguistic Range',
        description: 'Complexity and sophistication of language use.',
        maxScore: 2,
      },
    ],
    prepTime: 0, // Integrated with writing time
    responseTime: 20 * 60, // 20 minutes to respond
  }

  return (
    <UniversalQuestionPage
      module="writing"
      questionType="write-essay"
      question={question}
      instructions={writeEssayInstructions}
    >
      <WriteEssayPracticeArea questionId={question.id} />
    </UniversalQuestionPage>
  )
}