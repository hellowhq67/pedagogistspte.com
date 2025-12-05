'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Mic, StopCircle, PlayCircle, Volume2 } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'

interface RetellLecturePracticeAreaProps {
  questionId: string
  audioUrl?: string // Audio of the lecture
  imageUrl?: string // Optional image related to the lecture
}

export default function RetellLecturePracticeArea({
  questionId,
  audioUrl,
  imageUrl,
}: RetellLecturePracticeAreaProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null)
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false)
  const [isPlayingLecture, setIsPlayingLecture] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null)
  const lectureAudioRef = useRef<HTMLAudioElement | null>(null)

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
        setRecordedAudioURL(url)
        stream.getTracks().forEach((track) => track.stop()) // Stop microphone access
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordedAudio(null) // Clear previous recording
      setRecordedAudioURL(null)
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
    if (recordedAudioURL) {
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause()
        recordedAudioRef.current.currentTime = 0
      }
      recordedAudioRef.current = new Audio(recordedAudioURL)
      recordedAudioRef.current.onplay = () => setIsPlayingRecorded(true)
      recordedAudioRef.current.onended = () => setIsPlayingRecorded(false)
      recordedAudioRef.current.play()
    }
  }

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
      // Clean up URLs and audio objects on component unmount
      if (recordedAudioURL) {
        URL.revokeObjectURL(recordedAudioURL)
      }
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause()
        recordedAudioRef.current = null
      }
      if (lectureAudioRef.current) {
        lectureAudioRef.current.pause()
        lectureAudioRef.current = null
      }
    }
  }, [recordedAudioURL])

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
          <CardTitle>Lecture & Your Retelling</CardTitle>
          <CardDescription>
            Listen to the lecture and then retell its main points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl && (
            <div className="relative w-full h-auto max-h-60 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden mb-4">
              <Image
                src={imageUrl}
                alt="Lecture visual aid"
                layout="fill"
                objectFit="contain"
                className="p-2"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Button
              onClick={playLectureAudio}
              disabled={isPlayingLecture || isRecording || isPlayingRecorded || !audioUrl}
              variant="outline"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              {isPlayingLecture ? 'Playing Lecture...' : 'Play Lecture'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              disabled={isPlayingLecture || isPlayingRecorded}
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
            {recordedAudioURL && (
              <Button
                onClick={playRecordedAudio}
                disabled={isPlayingLecture || isRecording || isPlayingRecorded}
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
          {recordedAudioURL && !isRecording && (
            <p className="text-sm text-muted-foreground">
              Recording available. Click "Listen" to review or record again.
            </p>
          )}
          <Separator />
          {/* Placeholder for score display or AI feedback */}
          <div>
            <h4 className="font-semibold mb-2">AI Feedback (Coming Soon)</h4>
            <p className="text-sm text-muted-foreground">
              Your retelling will be analyzed for content accuracy, pronunciation, and fluency.
              Detailed feedback and scores will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

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