'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface WriteFromDictationPracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the sentence
}

export default function WriteFromDictationPracticeArea({
  questionId,
  audioUrl,
}: WriteFromDictationPracticeAreaProps) {
  const [userResponse, setUserResponse] = useState('')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const questionAudioRef = useRef<HTMLAudioElement | null>(null)

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

  useEffect(() => {
    return () => {
      if (questionAudioRef.current) {
        questionAudioRef.current.pause()
        questionAudioRef.current = null
      }
    }
  }, [])

  const handleSubmit = () => {
    console.log('Submitting dictated sentence for question:', questionId, userResponse)
    // Implement actual submission logic here
    alert(`Submitted: "${userResponse}" (Placeholder)`)
  }

  const isResponseEmpty = userResponse.trim() === ''

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listen & Type the Sentence</CardTitle>
          <CardDescription>
            Listen to the audio and type the exact sentence you hear.
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
          <Textarea
            placeholder="Type the sentence here..."
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            You can play the audio multiple times.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your typed sentence.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={isResponseEmpty}>
            Submit Sentence
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}