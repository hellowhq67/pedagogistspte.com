import { getQuestions } from '@/lib/actions/pte'
import { QuestionList } from '@/components/pte/practice/question-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
    title: 'Speaking Practice | PTE Academy',
    description: 'Practice PTE Speaking questions',
}

export default async function SpeakingPracticePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const type = typeof params.type === 'string' ? params.type : undefined
    const difficulty = typeof params.difficulty === 'string' ? params.difficulty : undefined

    const { data, total, limit } = await getQuestions({
        category: 'speaking',
        page,
        type,
        difficulty,
    })

    const speakingTypes = [
        'read_aloud',
        'repeat_sentence',
        'describe_image',
        'retell_lecture',
        'answer_short_question',
        'summarize_group_discussion',
        'respond_to_a_situation',
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
                <p className="text-muted-foreground">
                    Practice all speaking question types with AI scoring.
                </p>
            </div>

            <QuestionList
                questions={data}
                total={total}
                page={page}
                limit={limit}
                category="speaking"
                types={speakingTypes}
            />
        </div>
    )
}
