'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface ReadingFillInBlanksPracticeAreaProps {
  questionId: string
  options: any // This will be a JSONB field from the DB, containing text and options
}

export default function ReadingFillInBlanksPracticeArea({
  questionId,
  options,
}: ReadingFillInBlanksPracticeAreaProps) {
  // Assuming options is structured like:
  // {
  //   textSegments: ['The quick brown fox', '__BLANK__', 'over the lazy dog.'],
  //   blankOptions: {
  //     'BLANK_0': ['jumps', 'leaps', 'runs', 'sleeps'],
  //     // ... other blanks
  //   }
  // }
  const initialAnswers: { [key: string]: string } = {}
  options?.textSegments?.forEach((segment: string, index: number) => {
    if (segment === '__BLANK__') {
      initialAnswers[`BLANK_${index}`] = ''
    }
  })
  const [userAnswers, setUserAnswers] = useState(initialAnswers)

  const handleSelectChange = (blankKey: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [blankKey]: value }))
  }

  const handleSubmit = () => {
    console.log('Submitting answers for question:', questionId, userAnswers)
    // Implement actual submission logic here
    alert(`Submitted answers: ${JSON.stringify(userAnswers)} (Placeholder)`)
  }

  // Render the text with blanks as Select components
  const renderTextWithBlanks = () => {
    if (!options || !options.textSegments) {
      return <p>No text available for this question.</p>
    }

    return (
      <p className="text-lg leading-relaxed">
        {options.textSegments.map((segment: string, index: number) => {
          if (segment === '__BLANK__') {
            const blankKey = `BLANK_${index}`
            const blankOptions = options.blankOptions?.[blankKey] || []
            return (
              <span key={blankKey} className="inline-flex mx-1 align-middle">
                <Select
                  onValueChange={(value) => handleSelectChange(blankKey, value)}
                  value={userAnswers[blankKey]}
                >
                  <SelectTrigger className="w-[180px] text-base">
                    <SelectValue placeholder="Select a word" />
                  </SelectTrigger>
                  <SelectContent>
                    {blankOptions.map((option: string, optIndex: number) => (
                      <SelectItem key={optIndex} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <CardTitle>Complete the Text</CardTitle>
          <CardDescription>Select the best word for each blank from the dropdowns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-section">{renderTextWithBlanks()}</div>
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