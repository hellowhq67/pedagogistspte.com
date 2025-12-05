'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ListeningFillInBlanksPracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the spoken text
  options: any // This will be a JSONB field from the DB, containing text segments and blank IDs
}

export default function ListeningFillInBlanksPracticeArea({
  questionId,
  audioUrl,
  options,
}: ListeningFillInBlanksPracticeAreaProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const questionAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize user answers from options if available
    const initial: Record<string, string> = {}
    options?.textSegments?.forEach((segment: any) => {
      if (segment.type === 'blank') {
        initial[segment.id] = ''
      }
    })
    setUserAnswers(initial)

    return () => {
      if (questionAudioRef.current) {
        questionAudioRef.current.pause()
        questionAudioRef.current = null
      }
    }
  }, [options])

  const playQuestionAudio = useCallback(() => {
    if (audioUrl) {
      if (questionAudioRef.current) {
        questionAudioRef.current.pause()
        questionAudioRef.current.currentTime = 0
      }
      questionAudioRef.current = new Audio(audioUrl)
      questionAudioRef.current.onplay = () => setIsPlayingAudio(true)
      questionAudioRef.current.onended = () => setIsPlayingAudio(false)
      questionAudioRef.current.play().catch((e) => {
        console.error('Error playing audio:', e)
        setIsPlayingAudio(false)
      })
    }
  }, [audioUrl])

  const handleInputChange = (blankId: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [blankId]: value }))
  }

  const handleSubmit = () => {
    console.log('Submitting answers for question:', questionId, userAnswers)
    // Implement actual submission logic here
    alert(`Submitted answers: ${JSON.stringify(userAnswers)} (Placeholder)`)
  }

  const allBlanksFilled = Object.values(userAnswers).every((answer) => answer.trim() !== '')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listen & Fill in the Blanks</CardTitle>
          <CardDescription>
            Listen to the audio and type the missing words into the blanks below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={playQuestionAudio}
              disabled={isPlayingAudio || !audioUrl}
              variant="outline"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              {isPlayingAudio ? 'Playing Audio...' : 'Play Audio'}
            </Button>
          </div>
          <div className="text-lg leading-relaxed">
            {options?.textSegments?.map((segment: any, index: number) => (
              <span key={index}>
                {segment.type === 'text' && segment.value}
                {segment.type === 'blank' && (
                  <Input
                    type="text"
                    className="inline-block w-32 mx-1 text-base"
                    value={userAnswers[segment.id] || ''}
                    onChange={(e) => handleInputChange(segment.id, e.target.value)}
                    placeholder="_____"
                  />
                )}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!allBlanksFilled}>
            Submit Answers
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}