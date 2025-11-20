import { getQuestionById } from '@/lib/actions/pte'
import { SpeakingPractice } from '@/components/pte/practice/speaking-practice'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function SpeakingPracticeDetailPage({
    params,
}: {
    params: Promise<{ type: string; id: string }>
}) {
    const { type, id } = await params
    const question = await getQuestionById({ id, category: 'speaking' })

    if (!question) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/pte/academic/practice/speaking">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {type.replace(/_/g, ' ').toUpperCase()}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        ID: {question.id.slice(0, 8)}
                    </p>
                </div>
            </div>

            <SpeakingPractice question={question} category="speaking" />
        </div>
    )
}
