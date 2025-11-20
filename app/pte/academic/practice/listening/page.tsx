import { getQuestions } from '@/lib/actions/pte'
import { QuestionList } from '@/components/pte/practice/question-list'

export const metadata = {
    title: 'Listening Practice | PTE Academy',
    description: 'Practice PTE Listening questions',
}

export default async function ListeningPracticePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const type = typeof params.type === 'string' ? params.type : undefined
    const difficulty = typeof params.difficulty === 'string' ? params.difficulty : undefined

    const { data, total, limit } = await getQuestions({
        category: 'listening',
        page,
        type,
        difficulty,
    })

    const listeningTypes = [
        'summarize_spoken_text',
        'multiple_choice_multiple',
        'fill_in_blanks',
        'highlight_correct_summary',
        'multiple_choice_single',
        'select_missing_word',
        'highlight_incorrect_words',
        'write_from_dictation',
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Listening Practice</h1>
                <p className="text-muted-foreground">
                    Practice listening skills with audio-based questions.
                </p>
            </div>

            <QuestionList
                questions={data}
                total={total}
                page={page}
                limit={limit}
                category="listening"
                types={listeningTypes}
            />
        </div>
    )
}
