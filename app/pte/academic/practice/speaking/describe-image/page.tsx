import { UniversalQuestionListPage } from '@/components/pte/universal-question-list-page'
import {
  getSpeakingQuestionsWithStats,
  getSpeakingQuestionTypeStats,
} from '@/lib/pte/queries-enhanced'
import { Image } from 'lucide-react'

export default async function DescribeImageQuestionsPage() {
  return (
    <UniversalQuestionListPage
      module="speaking"
      questionType="describe_image"
      title="Describe Image"
      description="Practice describing various images clearly, using appropriate vocabulary and structure."
      icon={Image}
      basePath="/pte/academic/practice/speaking"
      getQuestions={() => getSpeakingQuestionsWithStats('describe_image')}
      getStats={() => getSpeakingQuestionTypeStats('describe_image')}
    />
  )
}