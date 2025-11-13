import { useState } from 'react'

interface ReOrderParagraphsProps {
  paragraphs: string[]
  onComplete?: (correctOrder: number[]) => void
}

export function ReOrderParagraphs({
  paragraphs,
  onComplete,
}: ReOrderParagraphsProps) {
  const [orderedParagraphs, setOrderedParagraphs] = useState<number[]>(
    Array.from({ length: paragraphs.length }, (_, i) => i)
  )

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))

    const newOrder = [...orderedParagraphs]
    const [movedItem] = newOrder.splice(sourceIndex, 1)
    newOrder.splice(targetIndex, 0, movedItem)

    setOrderedParagraphs(newOrder)
  }

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground mb-4 text-sm">
        Reorder the paragraphs to form a coherent text
      </div>

      {orderedParagraphs.map((index, position) => (
        <div
          key={position}
          draggable
          onDragStart={(e) => handleDragStart(e, position)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, position)}
          className="bg-card hover:bg-accent cursor-move rounded-lg border p-4"
        >
          <div className="mb-2 font-medium">Paragraph {position + 1}</div>
          <div>{paragraphs[index]}</div>
        </div>
      ))}
    </div>
  )
}
