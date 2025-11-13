import { initialCategories } from '@/lib/pte/data'
import ReadingPracticePage from '../page'

// Next 16: pre-render dynamic segment with generateStaticParams
export async function generateStaticParams() {
  return initialCategories
    .filter((c) => c.parent === 10) // Reading children
    .map((c) => ({ questionType: c.code }))
}

export default async function ReadingQuestionTypePage(props: {
  params: Promise<{ questionType: string }>
}) {
  const params = await props.params
  const { questionType } = await params
  return (
    <ReadingPracticePage params={Promise.resolve({ category: questionType })} />
  )
}
