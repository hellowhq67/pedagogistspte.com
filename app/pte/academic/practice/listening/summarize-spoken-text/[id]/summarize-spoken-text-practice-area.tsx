'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

interface SummarizeSpokenTextPracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the spoken text
}

export default function SummarizeSpokenTextPracticeArea({
  questionId,
  audioUrl,
}: SummarizeSpokenTextPracticeAreaProps) {
  const [userResponse, setUserResponse] = useState('')
  const [isPlayingLecture, setIsPlayingLecture] = useState(false)
  const lectureAudioRef = useRef<HTMLAudioElement | null>(null)

  const wordCount = useMemo(() => {
    return userResponse.trim().split(/\s+/).filter(Boolean).length
  }, [userResponse])

  const playLectureAudio = useCallback(() => {
    if (audioUrl) {
      if (lectureAudioRef.current) {
        lectureAudioRef.current.pause()
        lectureAudioRef.current.currentTime = 0
      }
      lectureAudioRef.current = new Audio(audioUrl)
      lectureAudioRef.current.onplay = () => setIsPlayingLecture(true)
      lectureAudioRef.current.onended = () => setIsPlayingLecture(false)
      lectureAudioRef.current.play().catch((e) => {
        console.error('Error playing lecture audio:', e)
        setIsPlayingLecture(false)
      })
    }
  }, [audioUrl])

  useEffect(() => {
    return () => {
      if (lectureAudioRef.current) {
        lectureAudioRef.current.pause()
        lectureAudioRef.current = null
      }
    }
  }, [])

  const handleSubmit = () => {
    console.log('Submitting summary for question:', questionId, userResponse)
    // Implement actual submission logic here
    alert(`Submitted summary (Word count: ${wordCount}) (Placeholder)`)
  }

  const isValidLength = wordCount >= 50 && wordCount <= 70

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spoken Text & Your Summary</CardTitle>
          <CardDescription>
            Listen to the lecture and then write a summary of 50-70 words.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={playLectureAudio}
              disabled={isPlayingLecture || !audioUrl}
              variant="outline"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              {isPlayingLecture ? 'Playing Lecture...' : 'Play Lecture'}
            </Button>
          </div>
          <Textarea
            placeholder="Type your summary here..."
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="text-right text-sm text-muted-foreground">
            Word count: {wordCount} {isValidLength ? '' : '(Must be 50-70 words)'}
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