import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { ListOrdered } from 'lucide-react'

async function getQuestions() {
  try {
    const result = await getQuestionsDirectly('reading', 'reorder_paragraphs', {
      page: 1,
      pageSize: 100,
      isActive: true,
    })

    return result.items.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching Reorder Paragraphs questions:', error)
    return []
  }
}

export default async function ReorderParagraphsPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <ListOrdered className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Re-order Paragraphs</h1>
          <p className="text-muted-foreground">
            Drag and drop paragraphs to arrange them in the correct logical order
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Your progress will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/reading"
            sectionType="reorder-paragraphs"
          />
        </CardContent>
      </Card>
    </div>
  )
}
