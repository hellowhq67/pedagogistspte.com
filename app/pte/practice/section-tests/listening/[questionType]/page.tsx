import { initialCategories } from '@/lib/pte/data'
import ListeningPracticePage from '../page'

// Next 16: pre-render dynamic segment with generateStaticParams
export async function generateStaticParams() {
  return initialCategories
    .filter((c) => c.parent === 16) // Listening children
    .map((c) => ({ questionType: c.code }))
}

export default async function ListeningQuestionTypePage(props: {
  params: Promise<{ questionType: string }>
}) {
  const params = await props.params
  const { questionType } = await params
  return (
    <ListeningPracticePage
      params={Promise.resolve({ category: questionType })}
    />
  )
}
