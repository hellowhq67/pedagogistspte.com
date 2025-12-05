'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface MultipleChoiceMultiplePracticeAreaProps {
  questionId: string
  options: any // This will be a JSONB field from the DB, so 'any' for now or a more specific type if schema is known
}

export default function MultipleChoiceMultiplePracticeArea({
  questionId,
  options,
}: MultipleChoiceMultiplePracticeAreaProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions((prev) => [...prev, key])
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== key))
    }
  }

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      console.log(
        'Submitting answer for question:',
        questionId,
        'Selected options:',
        selectedOptions
      )
      // Implement actual submission logic here
      alert(`Submitted: ${selectedOptions.join(', ')} (Placeholder)`)
    } else {
      alert('Please select at least one option.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose All Correct Answers</CardTitle>
          <CardDescription>Select all options that are correct based on the text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options && options.choices && options.choices.length > 0 ? (
            <div className="grid gap-2">
              {options.choices.map((choice: { key: string; text: string }, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={selectedOptions.includes(choice.key)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(choice.key, checked as boolean)
                    }
                  />
                  <Label htmlFor={`option-${index}`}>{choice.text}</Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No options available for this question.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your chosen answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={selectedOptions.length === 0}>
            Submit Answer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}