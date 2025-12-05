'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface MultipleChoiceSinglePracticeAreaProps {
  questionId: string
  options: any // This will be a JSONB field from the DB, so 'any' for now or a more specific type if schema is known
}

export default function MultipleChoiceSinglePracticeArea({
  questionId,
  options,
}: MultipleChoiceSinglePracticeAreaProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSubmit = () => {
    if (selectedOption) {
      console.log('Submitting answer for question:', questionId, 'Selected option:', selectedOption)
      // Implement actual submission logic here
      alert(`Submitted: ${selectedOption} (Placeholder)`)
    } else {
      alert('Please select an option first.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose the Best Answer</CardTitle>
          <CardDescription>Select one option that best completes the text or answers the question.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options && options.choices && options.choices.length > 0 ? (
            <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''}>
              {options.choices.map((choice: { key: string; text: string }, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={choice.key} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{choice.text}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-muted-foreground">No options available for this question.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your chosen answer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!selectedOption}>
            Submit Answer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}