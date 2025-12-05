'use client'

import React, { useCallback, useEffect, useState } from 'react'
import type { ListeningQuestionType } from '@/app/api/listening/schemas'
import { Button } from '@/components/ui/button'
import AudioPlayer from './AudioPlayer'
import AttemptsList from './ListeningAttemptsList'
import ListeningInput from './ListeningInput'

type Props = {
  questionId: string
  questionType: ListeningQuestionType
}

type QuestionPayload = {
  question: {
    id: string
    type: ListeningQuestionType
    title?: string | null
    promptText?: string | null
    promptMediaUrl?: string | null
    options?: any
    transcript?: string | null
    difficulty?: string | null
    createdAt?: string | null
  }
  prevId: string | null
  nextId: string | null
}

export default function ListeningQuestionClient({
  questionId,
  questionType,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [payload, setPayload] = useState<QuestionPayload | null>(null)

  const [userResponse, setUserResponse] = useState<any>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [attemptsKey, setAttemptsKey] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [audioPlayed, setAudioPlayed] = useState(false)

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(
        `/api/listening/questions/${encodeURIComponent(questionId)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Failed to load question (${res.status})`
        throw new Error(msg)
      }
      const data = (await res.json()) as QuestionPayload
      setPayload(data)
      setStartTime(Date.now())
      setAudioPlayed(false)
    } catch (e: any) {
      setFetchError(e?.message || 'Failed to load question.')
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  const onResponseChange = useCallback((response: any) => {
    setSubmitError(null)
    setUserResponse(response)
  }, [])

  const onSubmit = useCallback(async () => {
    if (!userResponse) {
      setSubmitError('Please provide an answer first.')
      return
    }

    if (!audioPlayed) {
      setSubmitError('Please play the audio at least once before submitting.')
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)

      const body = {
        questionId,
        type: questionType,
        userResponse,
        timeTaken,
      }

      const res = await fetch('/api/listening/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        setSubmitError(
          'Login required to submit attempts. Sign in to continue.'
        )
        return
      }

      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Submission failed (${res.status})`
        throw new Error(msg)
      }

      // Trigger attempts list refresh
      setAttemptsKey((k) => k + 1)
      // Reset for next attempt
      setUserResponse(null)
      setStartTime(Date.now())
      setAudioPlayed(false)
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to submit attempt.')
    } finally {
      setSubmitting(false)
    }
  }, [userResponse, questionId, questionType, startTime, audioPlayed])

  const handleAudioPlay = useCallback(() => {
    setAudioPlayed(true)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground rounded-md border p-4 text-sm">
          Loading question…
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-md border p-4 text-sm text-red-600"
        >
          {fetchError}
        </div>
      </div>
    )
  }

  const q = payload?.question

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{q?.title}</h2>
        {q?.promptText && (
          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>{q.promptText}</p>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {q?.promptMediaUrl && (
        <AudioPlayer audioUrl={q.promptMediaUrl} onPlay={handleAudioPlay} />
      )}

      {/* Input Component */}
      <div className="space-y-3 rounded-md border p-4">
        <ListeningInput
          questionType={questionType}
          question={q}
          value={userResponse}
          onChange={onResponseChange}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            aria-label="Submit attempt"
            onClick={onSubmit}
            disabled={!userResponse || submitting || !audioPlayed}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
          <a
            aria-label="Help for this task"
            href="/pte/ai-coach"
            className="text-sm underline"
          >
            Help
          </a>
        </div>

        {submitError ? (
          <div role="alert" className="text-sm text-red-600">
            {submitError}
            {submitError.toLowerCase().includes('login') ? (
              <span>
                {' '}
                ·{' '}
                <a href="/sign-in" className="underline">
                  Sign in
                </a>
              </span>
            ) : null}
          </div>
        ) : null}

        {!audioPlayed ? (
          <p className="text-xs text-amber-600">
            ⚠ Play the audio before submitting your answer.
          </p>
        ) : !userResponse ? (
          <p className="text-muted-foreground text-xs">
            Provide your answer, then click Submit to get scoring.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Ready to submit. Time elapsed:{' '}
            {Math.floor((Date.now() - startTime) / 1000)}s
          </p>
        )}
      </div>

      {/* Attempts list */}
      <div className="rounded-md border p-4">
        <AttemptsList key={attemptsKey} questionId={questionId} />
      </div>
    </div>
  )
}
