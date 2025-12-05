'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useState, useMemo } from 'react'

interface SummarizeWrittenTextPracticeAreaProps {
  questionId: string
}

export default function SummarizeWrittenTextPracticeArea({
  questionId,
}: SummarizeWrittenTextPracticeAreaProps) {
  const [userResponse, setUserResponse] = useState('')

  const wordCount = useMemo(() => {
    return userResponse.trim().split(/\s+/).filter(Boolean).length
  }, [userResponse])

  const handleSubmit = () => {
    console.log('Submitting summary for question:', questionId, userResponse)
    // Implement actual submission logic here
    alert(`Submitted summary: "${userResponse}" (Word count: ${wordCount}) (Placeholder)`)
  }

  const isValidLength = wordCount >= 5 && wordCount <= 75

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Summary</CardTitle>
          <CardDescription>
            Write a single-sentence summary (5-75 words) of the provided text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your summary here..."
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            className="min-h-[150px]"
          />
          <div className="text-right text-sm text-muted-foreground">
            Word count: {wordCount} {isValidLength ? '' : '(Must be 5-75 words)'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your summary for scoring.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!isValidLength}>
            Submit Summary
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}