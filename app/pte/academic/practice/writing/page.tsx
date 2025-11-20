import { getQuestions } from '@/lib/actions/pte'
import { QuestionList } from '@/components/pte/practice/question-list'

export const metadata = {
    title: 'Writing Practice | PTE Academy',
    description: 'Practice PTE Writing questions',
}

export default async function WritingPracticePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const type = typeof params.type === 'string' ? params.type : undefined
    const difficulty = typeof params.difficulty === 'string' ? params.difficulty : undefined

    const { data, total, limit } = await getQuestions({
        category: 'writing',
        page,
        type,
        difficulty,
    })

    const writingTypes = [
        'summarize_written_text',
        'write_essay',
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Writing Practice</h1>
                <p className="text-muted-foreground">
                    Practice essays and summaries with AI grading.
                </p>
            </div>

            <QuestionList
                questions={data}
                total={total}
                page={page}
                limit={limit}
                category="writing"
                types={writingTypes}
            />
        </div>
    )
}
