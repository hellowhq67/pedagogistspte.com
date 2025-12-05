'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bookmark, Star, Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import {
  UniversalQuestionPageComponentProps,
  QuestionInstructions,
  QuestionWithStats,
  PTEModule,
} from '@/lib/pte/types-enhanced'
import { formatScoreByModule } from '@/lib/pte/queries-enhanced'

export function UniversalQuestionPage({
  module,
  questionType,
  question,
  instructions,
  children,
  isLoading,
  error,
  onBookmarkToggle,
  onSkip,
}: UniversalQuestionPageComponentProps & {
  isLoading?: boolean
  error?: string
  onSkip?: (questionId: string) => void
}) {
  const router = useRouter()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handleAudioPlay = useCallback(() => {
    if (question.audioUrl) {
      const audio = new Audio(question.audioUrl)
      audio.onplay = () => setIsPlayingAudio(true)
      audio.onended = () => setIsPlayingAudio(false)
      audio.play().catch((e) => {
        console.error('Error playing audio:', e)
        setIsPlayingAudio(false)
      })
    }
  }, [question.audioUrl])

  const difficultyColors = {
    Easy: 'bg-green-500 hover:bg-green-600',
    Medium: 'bg-orange-500 hover:bg-orange-600',
    Hard: 'bg-red-500 hover:bg-red-600',
  }

  const handleBookmarkToggle = useCallback(() => {
    if (onBookmarkToggle) {
      onBookmarkToggle(question.id, !question.bookmarked)
    }
  }, [question.id, question.bookmarked, onBookmarkToggle])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6 text-red-500">
        <p>Error loading question: {error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to {questionType} List
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{question.title}</CardTitle>
              <CardDescription className="capitalize">
                {module} - {questionType.replace(/-/g, ' ')}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={cn('text-white', difficultyColors[question.difficulty])}>
                {question.difficulty}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmarkToggle}
                aria-label={question.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Bookmark className={cn('h-5 w-5', question.bookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{question.promptText}</p>
          {question.audioUrl && (
            <div className="flex items-center gap-2">
              <Button onClick={handleAudioPlay} disabled={isPlayingAudio} aria-label="Play audio">
                <Volume2 className="h-5 w-5 mr-2" />
                {isPlayingAudio ? 'Playing...' : 'Play Audio'}
              </Button>
            </div>
          )}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Community Avg Score</p>
              <p className="text-xl font-semibold">
                {formatScoreByModule(question.communityAverageScore, module)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Community Practices</p>
              <p className="text-xl font-semibold">
                {question.communityPracticeCount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Best Score</p>
              <p className="text-xl font-semibold">
                {formatScoreByModule(question.userBestScore, module)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Practices</p>
              <p className="text-xl font-semibold">
                {question.userPracticeCount.toLocaleString()}
              </p>
            </div>
          </div>
          <Separator />
          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-2">Instructions</h3>
            <p className="text-muted-foreground mb-4">{instructions.taskDescription}</p>
            {instructions.tips && instructions.tips.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium">Tips:</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {instructions.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {instructions.scoringCriteria && instructions.scoringCriteria.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium">Scoring Criteria:</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {instructions.scoringCriteria.map((criteria, index) => (
                    <li key={index}>
                      {criteria.name}: {criteria.description} (Max Score: {criteria.maxScore})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Separator />
            {children}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {onSkip && (
              <Button variant="outline" onClick={() => onSkip(question.id)}>
                Skip Question
              </Button>
            )}
            <Button>Submit Answer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}