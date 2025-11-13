'use client'

import React, { useCallback, useMemo } from 'react'
import type { ListeningQuestionType } from '@/app/api/listening/schemas'
import type { ReadingQuestionType } from '@/app/api/reading/schemas'
import type { WritingQuestionType } from '@/app/api/writing/schemas'
import ListeningAttempt from '@/components/pte/attempt/ListeningAttempt'
import ReadingAttempt from '@/components/pte/attempt/ReadingAttempt'
// Attempt orchestration UIs (authentic timers + server-validated sessions)
import SpeakingAttempt from '@/components/pte/attempt/SpeakingAttempt'
import WritingAttempt from '@/components/pte/attempt/WritingAttempt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Types from API schemas (for strong typing of questionType props)
import type { SpeakingType } from '@/lib/pte/types'

type Section = 'speaking' | 'writing' | 'reading' | 'listening'

type BaseQuestion = {
  id: string
  type: string // raw type from question payload; we will normalize it per section
  title?: string
  description?: string
  // Common media/text fields used to build prompts
  text?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
  promptText?: string | null
  promptMediaUrl?: string | null
  difficulty?: string | null
  // Raw options/answers for reading/listening
  options?: any
  correctAnswer?: any
}

export interface QuestionInterfaceProps {
  // If not provided, the component will try to infer from question.type
  section?: Section
  question: BaseQuestion
  // Optional: per-item answer duration override for reading/listening practice pages
  answerMs?: number
  // Optional callback after a successful submission (Attempt components call this onSubmitted)
  onComplete?: (result?: any) => void
  // Legacy flag: kept for compatibility; real feedback is not handled here
  showFeedback?: boolean
}

/**
 * QuestionInterface (Unified)
 *
 * Thin, accessible wrapper that delegates rendering to the new Attempt components:
 *  - SpeakingAttempt
 *  - WritingAttempt
 *  - ReadingAttempt
 *  - ListeningAttempt
 *
 * This preserves existing pages that use QuestionInterface while upgrading them to
 * authentic PTE timings + server-validated sessions + auto-submit on expiry.
 */
export default function QuestionInterface({
  section,
  question,
  answerMs,
  onComplete,
}: QuestionInterfaceProps) {
  const resolvedSection: Section = useMemo(() => {
    if (section) return section
    const t = (question.type || '').toLowerCase()
    if (
      t.includes('read_aloud') ||
      t.includes('repeat_sentence') ||
      t.includes('describe_image') ||
      t.includes('retell_lecture') ||
      t.includes('answer_short') ||
      t.includes('respond_to_a_situation') ||
      t.includes('summarize_group_discussion')
    )
      return 'speaking'
    if (t.includes('summarize') || t.includes('essay') || t.includes('write'))
      return 'writing'
    if (
      t.includes('reorder') ||
      t.includes('fill_in_blanks') ||
      t.includes('reading_writing_fill_blanks') ||
      t.includes('multiple_choice_single') ||
      t.includes('multiple_choice_multiple')
    )
      return 'reading'
    if (
      t.includes('summarize_spoken_text') ||
      t.includes('write_from_dictation') ||
      t.includes('highlight_correct_summary') ||
      t.includes('select_missing_word') ||
      t.includes('highlight_incorrect_words') ||
      t.includes('fill_in_blanks') ||
      t.includes('multiple_choice_single') ||
      t.includes('multiple_choice_multiple')
    )
      return 'listening'
    // Default to reading for fallback
    return 'reading'
  }, [question.type, section])

  const title = useMemo(() => {
    return question.title || 'Practice'
  }, [question.title])

  // Normalize prompt from the heterogeneous "question" payload
  const speakingPrompt = useMemo(
    () => ({
      title: question.title ?? undefined,
      promptText:
        (question.text ??
          question.description ??
          question.promptText ??
          undefined) ||
        undefined,
      promptMediaUrl:
        (question.audioUrl ?? question.promptMediaUrl ?? undefined) ||
        undefined,
      difficulty: question.difficulty ?? undefined,
    }),
    [
      question.description,
      question.difficulty,
      question.promptMediaUrl,
      question.promptText,
      question.text,
      question.audioUrl,
      question.title,
    ]
  )

  const readListenPrompt = useMemo(
    () => ({
      id: question.id,
      type: question.type,
      title: question.title ?? undefined,
      promptText:
        (question.text ??
          question.description ??
          question.promptText ??
          undefined) ||
        undefined,
      promptMediaUrl:
        (question.audioUrl ?? question.promptMediaUrl ?? undefined) ||
        undefined,
      options: question.options,
      difficulty: question.difficulty ?? undefined,
    }),
    [
      question.description,
      question.difficulty,
      question.id,
      question.options,
      question.promptMediaUrl,
      question.promptText,
      question.text,
      question.audioUrl,
      question.title,
      question.type,
    ]
  )

  const handleSubmitted = useCallback(
    (attemptId?: string) => {
      try {
        onComplete?.({ attemptId })
      } catch {
        // ignore
      }
    },
    [onComplete]
  )

  const renderAttempt = () => {
    const raw = (question.type || '').toLowerCase()

    switch (resolvedSection) {
      case 'speaking': {
        const qType = normalizeSpeakingType(raw)
        return (
          <SpeakingAttempt
            questionId={question.id}
            questionType={qType}
            prompt={speakingPrompt}
            onSubmitted={handleSubmitted}
          />
        )
      }

      case 'writing': {
        const qType = normalizeWritingType(raw)
        return (
          <WritingAttempt
            questionId={question.id}
            questionType={qType}
            prompt={{
              title: question.title ?? undefined,
              promptText:
                (question.text ??
                  question.description ??
                  question.promptText ??
                  undefined) ||
                undefined,
              difficulty: question.difficulty ?? undefined,
            }}
            onSubmitted={handleSubmitted}
          />
        )
      }

      case 'reading': {
        const qType = normalizeReadingType(raw)
        return (
          <ReadingAttempt
            questionId={question.id}
            questionType={qType}
            prompt={readListenPrompt as any}
            answerMs={answerMs}
            onSubmitted={handleSubmitted}
          />
        )
      }

      case 'listening': {
        const qType = normalizeListeningType(raw)
        return (
          <ListeningAttempt
            questionId={question.id}
            questionType={qType}
            prompt={readListenPrompt as any}
            answerMs={answerMs}
            onSubmitted={handleSubmitted}
          />
        )
      }

      default:
        return <div className="rounded-md border p-4">Unsupported section.</div>
    }
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderAttempt()}</CardContent>
    </Card>
  )
}

// Normalizers
function normalizeSpeakingType(t: string): SpeakingType {
  if (t.includes('read_aloud')) return 'read_aloud'
  if (t.includes('repeat_sentence')) return 'repeat_sentence'
  if (t.includes('describe_image')) return 'describe_image'
  if (t.includes('retell_lecture')) return 'retell_lecture'
  if (t.includes('answer_short')) return 'answer_short_question'
  if (t.includes('respond_to_a_situation')) return 'respond_to_a_situation'
  if (t.includes('summarize_group_discussion'))
    return 'summarize_group_discussion'
  // default to read_aloud to keep usage safe
  return 'read_aloud'
}

function normalizeWritingType(t: string): WritingQuestionType {
  if (t.includes('summarize')) return 'summarize_written_text'
  if (t.includes('essay') || t.includes('write_essay')) return 'write_essay'
  // default
  return 'write_essay'
}

function normalizeReadingType(t: string): ReadingQuestionType {
  if (t.includes('reading_writing_fill_blanks'))
    return 'reading_writing_fill_blanks'
  if (t.includes('reorder')) return 'reorder_paragraphs'
  if (t.includes('multiple_choice_multiple')) return 'multiple_choice_multiple'
  if (t.includes('multiple_choice_single')) return 'multiple_choice_single'
  if (t.includes('fill_in_blanks')) return 'fill_in_blanks'
  // default
  return 'fill_in_blanks'
}

function normalizeListeningType(t: string): ListeningQuestionType {
  if (t.includes('summarize_spoken_text')) return 'summarize_spoken_text'
  if (t.includes('write_from_dictation')) return 'write_from_dictation'
  if (t.includes('highlight_incorrect_words'))
    return 'highlight_incorrect_words'
  if (t.includes('highlight_correct_summary'))
    return 'highlight_correct_summary'
  if (t.includes('select_missing_word')) return 'select_missing_word'
  if (t.includes('multiple_choice_multiple')) return 'multiple_choice_multiple'
  if (t.includes('multiple_choice_single')) return 'multiple_choice_single'
  if (t.includes('fill_in_blanks')) return 'fill_in_blanks'
  // default
  return 'fill_in_blanks'
}
