import { getQuestions } from '@/lib/actions/pte'
import { QuestionList } from '@/components/pte/practice/question-list'

export const metadata = {
    title: 'Reading Practice | PTE Academy',
    description: 'Practice PTE Reading questions',
}

export default async function ReadingPracticePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const type = typeof params.type === 'string' ? params.type : undefined
    const difficulty = typeof params.difficulty === 'string' ? params.difficulty : undefined

    const { data, total, limit } = await getQuestions({
        category: 'reading',
        page,
        type,
        difficulty,
    })

    const readingTypes = [
        'mcq_single',
        'mcq_multiple',
        'reorder_paragraphs',
        'fill_in_blanks',
        'reading_writing_fill_blanks',
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reading Practice</h1>
                <p className="text-muted-foreground">
                    Practice reading comprehension and vocabulary.
                </p>
            </div>

            <QuestionList
                questions={data}
                total={total}
                page={page}
                limit={limit}
                category="reading"
                types={readingTypes}
            />
        </div>
    )
}
