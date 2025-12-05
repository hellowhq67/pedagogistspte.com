'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ListeningMultipleChoiceSinglePracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the spoken text
  options: any // This will be a JSONB field from the DB, so 'any' for now or a more specific type if schema is known
}

export default function ListeningMultipleChoiceSinglePracticeArea({
  questionId,
  audioUrl,
  options,
}: ListeningMultipleChoiceSinglePracticeAreaProps) {
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
          <CardTitle>Listen & Choose the Best Answer</CardTitle>
          <CardDescription>Listen to the audio and select the single best option.</CardDescription>
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