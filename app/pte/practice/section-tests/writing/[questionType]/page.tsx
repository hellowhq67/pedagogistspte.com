import { initialCategories } from '@/lib/pte/data'
import WritingPracticePage from '../page'

// Next 16: pre-render dynamic segment with generateStaticParams
export async function generateStaticParams() {
  return initialCategories
    .filter((c) => c.parent === 7) // Writing children
    .map((c) => ({ questionType: c.code }))
}

export default async function WritingQuestionTypePage(props: {
  params: Promise<{ questionType: string }>
}) {
  const params = await props.params
  const { questionType } = await params
  return (
    <WritingPracticePage params={Promise.resolve({ category: questionType })} />
  )
}
