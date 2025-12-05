'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
// Placeholder for drag-and-drop library imports
// import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd'

interface ReadingWritingFillBlanksPracticeAreaProps {
  questionId: string
  options: any // This will be a JSONB field from the DB, containing text segments and word choices
}

export default function ReadingWritingFillBlanksPracticeArea({
  questionId,
  options,
}: ReadingWritingFillBlanksPracticeAreaProps) {
  // Assuming options is structured like:
  // {
  //   textSegments: ['The sun __BLANK__ brightly.', '__BLANK__ birds sang.'],
  //   wordChoices: ['shines', 'Many', 'loudly']
  // }
  const initialAnswers: { [key: string]: string } = {}
  options?.textSegments?.forEach((segment: string, index: number) => {
    if (segment.includes('__BLANK__')) {
      initialAnswers[`BLANK_${index}`] = ''
    }
  })
  const [userAnswers, setUserAnswers] = useState(initialAnswers)
  const [availableWords, setAvailableWords] = useState(options?.wordChoices || [])

  // Placeholder for drag and drop functionality
  const handleWordSelect = (blankKey: string, word: string) => {
    setUserAnswers((prev) => {
      const newAnswers = { ...prev }
      const oldWord = newAnswers[blankKey]

      // If a word was already in this blank, return it to available words
      if (oldWord && oldWord !== word) {
        setAvailableWords((prevWords) => [...prevWords, oldWord])
      }

      newAnswers[blankKey] = word
      return newAnswers
    })
    setAvailableWords((prevWords) => prevWords.filter((w: string) => w !== word))
  }

  const handleSubmit = () => {
    console.log('Submitting answers for question:', questionId, userAnswers)
    // Implement actual submission logic here
    alert(`Submitted answers: ${JSON.stringify(userAnswers)} (Placeholder)`)
  }

  const renderTextWithBlanks = () => {
    if (!options || !options.textSegments) {
      return <p>No text available for this question.</p>
    }

    return (
      <p className="text-lg leading-relaxed">
        {options.textSegments.map((segment: string, index: number) => {
          if (segment.includes('__BLANK__')) {
            const blankKey = `BLANK_${index}`
            const currentAnswer = userAnswers[blankKey]
            return (
              <span key={blankKey} className="inline-flex mx-1 align-middle">
                {/* In a real implementation, this would be a draggable target */}
                <Button
                  variant="outline"
                  className="w-[120px] h-10 text-base flex-shrink-0"
                  onClick={() => {
                    // For now, allow selection from available words on click
                    const newWord = prompt(`Enter word for blank ${index + 1} from: ${availableWords.join(', ')}`, currentAnswer);
                    if (newWord && availableWords.includes(newWord)) {
                      handleWordSelect(blankKey, newWord);
                    } else if (newWord && !availableWords.includes(newWord) && currentAnswer !== newWord) {
                      alert("Word not available or already used.");
                    } else if (!newWord && currentAnswer) {
                        // If user clears the blank, return word to available
                        setAvailableWords((prevWords) => [...prevWords, currentAnswer]);
                        setUserAnswers((prev) => ({ ...prev, [blankKey]: '' }));
                    }
                  }}
                >
                  {currentAnswer || '_______'}
                </Button>
              </span>
            )
          }
          return <span key={index}>{segment}</span>
        })}
      </p>
    )
  }

  const allBlanksFilled = Object.values(userAnswers).every((answer) => answer !== '')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete the Text by Dragging Words</CardTitle>
          <CardDescription>
            Drag words from the box below into the correct blanks to complete the text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-section mb-4">{renderTextWithBlanks()}</div>

          <h4 className="font-semibold text-lg mb-2">Word Choices:</h4>
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-secondary">
            {availableWords.length > 0 ? (
              availableWords.map((word: string, index: number) => (
                // In a real implementation, these would be draggable items
                <Button key={index} variant="secondary" className="cursor-grab">
                  {word}
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground">All words placed.</p>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            (Drag and drop functionality will be fully implemented soon, currently select by clicking blanks and typing from list)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your completed text.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!allBlanksFilled}>
            Submit Answer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}