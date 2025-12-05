'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface SelectMissingWordPracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the spoken text with beep
  options: any // This will be a JSONB field from the DB, containing word options
}

export default function SelectMissingWordPracticeArea({
  questionId,
  audioUrl,
  options,
}: SelectMissingWordPracticeAreaProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
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
    if (selectedOption) {
      console.log('Submitting word for question:', questionId, 'Selected option:', selectedOption)
      // Implement actual submission logic here
      alert(`Submitted: ${selectedOption} (Placeholder)`)
    } else {
      alert('Please select a word first.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listen & Select the Missing Word</CardTitle>
          <CardDescription>
            Listen to the audio and select the word that completes the recording.
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
          {options && options.words && options.words.length > 0 ? (
            <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''}>
              {options.words.map((word: { key: string; text: string }, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={word.key} id={`word-${index}`} />
                  <Label htmlFor={`word-${index}`}>{word.text}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-muted-foreground">No word options available for this question.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Submit your chosen word.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!selectedOption}>
            Submit Word
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}