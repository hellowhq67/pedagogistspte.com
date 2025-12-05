'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface HighlightIncorrectWordsPracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the spoken text
  transcript: string // The text transcript with potential incorrect words
}

export default function HighlightIncorrectWordsPracticeArea({
  questionId,
  audioUrl,
  transcript,
}: HighlightIncorrectWordsPracticeAreaProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const questionAudioRef = useRef<HTMLAudioElement | null>(null)
  const [highlightedWords, setHighlightedWords] = useState<number[]>([]) // Indices of highlighted words

  const words = transcript.split(/\s+/) // Simple split for now, might need more robust tokenization

  const toggleHighlight = (index: number) => {
    setHighlightedWords((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

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
    console.log('Submitting highlighted words for question:', questionId, highlightedWords)
    // Implement actual submission logic here
    alert(`Submitted highlighted words (indices): ${highlightedWords.join(', ')} (Placeholder)`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listen & Highlight Incorrect Words</CardTitle>
          <CardDescription>
            Listen to the audio and click on the words in the transcript that are different.
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
          <div className="text-lg leading-relaxed border p-4 rounded-md bg-secondary">
            {words.map((word, index) => (
              <span
                key={index}
                className={cn(
                  'cursor-pointer mx-0.5 px-0.5 rounded',
                  highlightedWords.includes(index) && 'bg-yellow-300 text-black'
                )}
                onClick={() => toggleHighlight(index)}
              >
                {word}{' '}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Click on a word to highlight it as incorrect. Click again to unhighlight.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your highlighted words.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit}>
            Submit Answers
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}