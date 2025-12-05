'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useState, useMemo } from 'react'

interface WriteEssayPracticeAreaProps {
  questionId: string
}

export default function WriteEssayPracticeArea({
  questionId,
}: WriteEssayPracticeAreaProps) {
  const [userResponse, setUserResponse] = useState('')

  const wordCount = useMemo(() => {
    return userResponse.trim().split(/\s+/).filter(Boolean).length
  }, [userResponse])

  const handleSubmit = () => {
    console.log('Submitting essay for question:', questionId, userResponse)
    // Implement actual submission logic here
    alert(`Submitted essay (Word count: ${wordCount}) (Placeholder)`)
  }

  const isValidLength = wordCount >= 200 && wordCount <= 300

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Essay</CardTitle>
          <CardDescription>
            Write your essay here (200-300 words).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your essay here..."
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            className="min-h-[300px]"
          />
          <div className="text-right text-sm text-muted-foreground">
            Word count: {wordCount} {isValidLength ? '' : '(Must be 200-300 words)'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your essay for scoring.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!isValidLength}>
            Submit Essay
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}