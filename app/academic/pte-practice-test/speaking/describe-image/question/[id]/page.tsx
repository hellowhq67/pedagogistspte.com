import SpeakingQuestionClient from '@/components/pte/speaking/SpeakingQuestionClient'

type Params = {
  params: Promise<{ id: string }>
}

export default async function DescribeImageQuestionPage(props: Params) {
  const { id } = await props.params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Describe Image — Question {id}</h1>
        <SpeakingQuestionClient questionId={id} questionType="describe_image" />
      </div>
    </div>
  )
}
