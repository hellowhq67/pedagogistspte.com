'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Volume2, Mic, StopCircle, PlayCircle } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface RepeatSentencePracticeAreaProps {
  questionId: string
  // You might pass the audio URL for the sentence here if it's not part of the main question object
  // sentenceAudioUrl: string;
}

export default function RepeatSentencePracticeArea({
  questionId,
}: RepeatSentencePracticeAreaProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false)
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false) // For playing the sentence prompt
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const promptAudioRef = useRef<HTMLAudioElement | null>(null) // For prompt audio playback

  // Placeholder for the actual sentence audio URL
  const sentenceAudioUrl =
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' // Replace with actual question audio

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })
        setRecordedAudio(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        stream.getTracks().forEach((track) => track.stop()) // Stop microphone access
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordedAudio(null) // Clear previous recording
      setAudioURL(null)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not start recording. Please ensure microphone access is granted.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecordedAudio = () => {
    if (audioURL) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      audioRef.current = new Audio(audioURL)
      audioRef.current.onplay = () => setIsPlayingRecorded(true)
      audioRef.current.onended = () => setIsPlayingRecorded(false)
      audioRef.current.play()
    }
  }

  const playPromptAudio = useCallback(() => {
    if (sentenceAudioUrl) {
      if (promptAudioRef.current) {
        promptAudioRef.current.pause()
        promptAudioRef.current.currentTime = 0
      }
      promptAudioRef.current = new Audio(sentenceAudioUrl)
      promptAudioRef.current.onplay = () => setIsPlayingPrompt(true)
      promptAudioRef.current.onended = () => setIsPlayingPrompt(false)
      promptAudioRef.current.play().catch((e) => {
        console.error('Error playing prompt audio:', e)
        setIsPlayingPrompt(false)
      })
    }
  }, [sentenceAudioUrl])

  useEffect(() => {
    return () => {
      // Clean up URL and audio object on component unmount
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (promptAudioRef.current) {
        promptAudioRef.current.pause()
        promptAudioRef.current = null
      }
    }
  }, [audioURL])

  // Placeholder for submitting the recording
  const handleSubmitRecording = () => {
    if (recordedAudio) {
      console.log('Submitting recorded audio for question:', questionId, recordedAudio)
      // Implement actual submission logic here (e.g., upload to server)
      alert('Recording submitted! (Placeholder)')
    } else {
      alert('Please record your response first.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentence Playback & Your Response</CardTitle>
          <CardDescription>
            Listen to the sentence and then record your repetition.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={playPromptAudio}
              disabled={isPlayingPrompt || isRecording || isPlayingRecorded}
              variant="outline"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              {isPlayingPrompt ? 'Playing Sentence...' : 'Play Sentence'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              disabled={isPlayingRecorded || isPlayingPrompt}
            >
              {isRecording ? (
                <>
                  <StopCircle className="h-5 w-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            {audioURL && (
              <Button
                onClick={playRecordedAudio}
                disabled={isPlayingRecorded || isRecording || isPlayingPrompt}
                variant="outline"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                {isPlayingRecorded ? 'Playing...' : 'Listen to Recording'}
              </Button>
            )}
          </div>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <Progress value={50} className="w-full" /> {/* Placeholder progress */}
              <span className="text-sm text-muted-foreground">Recording...</span>
            </div>
          )}
          {audioURL && !isRecording && (
            <p className="text-sm text-muted-foreground">
              Recording available. Click "Listen" to review or record again.
            </p>
          )}
          <Separator />
          {/* Placeholder for score display or AI feedback */}
          <div>
            <h4 className="font-semibold mb-2">AI Feedback (Coming Soon)</h4>
            <p className="text-sm text-muted-foreground">
              Your repeated sentence will be analyzed for pronunciation, fluency, and content.
              Detailed feedback and scores will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* This section would typically contain the input area for the user's response or other practice elements */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Controls</CardTitle>
          <CardDescription>Review your response and submit for scoring.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmitRecording} disabled={!recordedAudio || isRecording}>
            Submit Response
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}