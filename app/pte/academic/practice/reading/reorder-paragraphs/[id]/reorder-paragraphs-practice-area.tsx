'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd' // Placeholder import

interface ReorderParagraphsPracticeAreaProps {
  questionId: string
  options: any // This will contain the jumbled paragraphs
}

export default function ReorderParagraphsPracticeArea({
  questionId,
  options,
}: ReorderParagraphsPracticeAreaProps) {
  // Assuming 'options' contains an array of paragraphs like:
  // { paragraphs: [{ id: '1', text: 'Paragraph A' }, { id: '2', text: 'Paragraph B' }] }
  const initialParagraphs = options?.paragraphs || []
  const [paragraphs, setParagraphs] = useState(initialParagraphs)

  // Placeholder for drag and drop logic
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const reorderedParagraphs = Array.from(paragraphs)
    const [removed] = reorderedParagraphs.splice(result.source.index, 1)
    reorderedParagraphs.splice(result.destination.index, 0, removed)

    setParagraphs(reorderedParagraphs)
  }

  const handleSubmit = () => {
    console.log('Submitting reordered paragraphs for question:', questionId, paragraphs)
    // Implement actual submission logic here
    alert(`Submitted order: ${paragraphs.map((p: any) => p.text).join(' | ')} (Placeholder)`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reorder Paragraphs</CardTitle>
          <CardDescription>Drag and drop the paragraphs to form a coherent text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialParagraphs.length > 0 ? (
            <div className="border rounded-md p-4 space-y-2">
              <h4 className="font-semibold text-lg mb-2">Jumbled Paragraphs:</h4>
              <p className="text-muted-foreground">
                (Drag and drop functionality will be fully implemented soon, currently displays order)
              </p>
              {/* This section would ideally be a DragDropContext */}
              <div className="space-y-2">
                {paragraphs.map((paragraph: any, index: number) => (
                  <div key={paragraph.id} className="p-3 border rounded-md bg-secondary flex items-center gap-2">
                    <span className="font-bold text-muted-foreground">{index + 1}.</span>
                    <p className="flex-grow">{paragraph.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No paragraphs available for this question.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your reordered paragraphs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={paragraphs.length === 0}>
            Submit Answer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}