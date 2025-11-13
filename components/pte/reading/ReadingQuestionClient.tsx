'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReadingQuestionType } from '@/app/api/reading/schemas'
import { Button } from '@/components/ui/button'
import AttemptsList from './ReadingAttemptsList'
import ReadingInput from './ReadingInput'

type Props = {
  questionId: string
  questionType: ReadingQuestionType
}

type QuestionPayload = {
  question: {
    id: string
    type: ReadingQuestionType
    title?: string | null
    promptText?: string | null
    options?: any
    difficulty?: string | null
    createdAt?: string | null
  }
  prevId: string | null
  nextId: string | null
}

export default function ReadingQuestionClient({
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

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(
        `/api/reading/questions/${encodeURIComponent(questionId)}`,
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
      setStartTime(Date.now()) // Reset timer when new question loads
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
    setSubmitError(null)

    setSubmitting(true)
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000) // in seconds

      const body = {
        questionId,
        type: questionType,
        userResponse,
        timeTaken,
      }
      const res = await fetch('/api/reading/attempts', {
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

      const json = await res.json()
      // Trigger attempts list refresh
      setAttemptsKey((k) => k + 1)
      // Reset for next attempt
      setUserResponse(null)
      setStartTime(Date.now())
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to submit attempt.')
    } finally {
      setSubmitting(false)
    }
  }, [userResponse, questionId, questionType, startTime])

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
      {/* Question Prompt */}
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{q?.title}</h2>
        <div className="prose prose-sm max-w-none">
          <p>{q?.promptText}</p>
        </div>
      </div>

      {/* Input Component */}
      <div className="space-y-3 rounded-md border p-4">
        <ReadingInput
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
            disabled={!userResponse || submitting}
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

        {!userResponse ? (
          <p className="text-muted-foreground text-xs">
            Provide your answer, then click Submit to get AI scoring.
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
