'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Volume2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ListeningMultipleChoiceMultiplePracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the spoken text
  options: any // This will be a JSONB field from the DB, so 'any' for now or a more specific type if schema is known
}

export default function ListeningMultipleChoiceMultiplePracticeArea({
  questionId,
  audioUrl,
  options,
}: ListeningMultipleChoiceMultiplePracticeAreaProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const questionAudioRef = useRef<HTMLAudioElement | null>(null)

  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions((prev) => [...prev, key])
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== key))
    }
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
    if (selectedOptions.length > 0) {
      console.log(
        'Submitting answers for question:',
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
          <CardTitle>Listen & Choose All Correct Answers</CardTitle>
          <CardDescription>
            Listen to the audio and select all options that are correct.
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