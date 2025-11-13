import 'server-only'
import { generateAIFeedback } from '@/lib/pte/ai-feedback'
import {
  QuestionType,
  TestSection,
  type SpeakingScore,
  type SpeakingType,
} from '@/lib/pte/types'

/**
 * Score a speaking attempt using available adapters.
 * Prefers AI feedback when available; otherwise falls back to simple heuristics.
 */
export async function scoreAttempt(params: {
  type: SpeakingType
  question: any
  transcript: string
  audioUrl: string
  durationMs: number
}): Promise<
  SpeakingScore & { feedback?: any; meta?: Record<string, unknown> }
> {
  const { type, transcript = '', durationMs } = params

  const words = tokenizeWords(transcript)
  const wordCount = words.length
  const minutes = Math.max(durationMs / 60000, 0.001)
  const wordsPerMinute = Number((wordCount / minutes).toFixed(2))
  const fillerRate = Number(computeFillerRate(words).toFixed(3))

  const meta: Record<string, unknown> = {
    words: wordCount,
    wordsPerMinute,
    fillerRate,
  }

  // Try AI feedback (uses OpenAI if configured; otherwise mocked)
  try {
    const qType = mapSpeakingToQuestionType(type)
    const ai = await generateAIFeedback(qType, TestSection.SPEAKING, transcript)
    meta.ai = { provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock' }

    // Map AI feedback to SpeakingScore fields with reasonable defaults
    const pronunciation = clamp0to90(
      ai.pronunciation?.score ?? roughPronunciation(wordsPerMinute, fillerRate)
    )
    const fluency = clamp0to90(
      ai.fluency?.score ?? roughFluency(wordsPerMinute, fillerRate)
    )
    const content = clamp0to90(
      ai.content?.score ?? roughContent(wordCount, durationMs)
    )

    const total = clamp0to90(
      Math.round(0.4 * content + 0.3 * pronunciation + 0.3 * fluency)
    )

    const rubric = {
      contentNotes: ai.content?.feedback,
      fluencyNotes: ai.fluency?.feedback,
      pronunciationNotes: ai.pronunciation?.feedback,
      details: {
        suggestions: ai.suggestions,
        strengths: ai.strengths,
        areasForImprovement: ai.areasForImprovement,
      },
    }

    return {
      content,
      pronunciation,
      fluency,
      total,
      rubric,
      feedback: ai,
      meta,
    }
  } catch (err) {
    // Fall back to heuristics
    meta.aiError = err instanceof Error ? err.message : 'ai_feedback_failed'

    const pronunciation = clamp0to90(
      roughPronunciation(wordsPerMinute, fillerRate)
    )
    const fluency = clamp0to90(roughFluency(wordsPerMinute, fillerRate))
    const content = clamp0to90(roughContent(wordCount, durationMs))
    const total = clamp0to90(
      Math.round(0.4 * content + 0.3 * pronunciation + 0.3 * fluency)
    )

    return {
      content,
      pronunciation,
      fluency,
      total,
      rubric: {
        details: { note: 'Heuristic scoring (AI unavailable).' },
      },
      meta,
    }
  }
}

/** Helpers **/

function mapSpeakingToQuestionType(t: SpeakingType): QuestionType {
  switch (t) {
    case 'read_aloud':
      return QuestionType.READ_ALOUD
    case 'repeat_sentence':
      return QuestionType.REPEAT_SENTENCE
    case 'describe_image':
      return QuestionType.DESCRIBE_IMAGE
    case 'retell_lecture':
      return QuestionType.RE_TELL_LECTURE
    case 'answer_short_question':
      return QuestionType.ANSWER_SHORT_QUESTION
    // Not present in QuestionType enum; map to closest for feedback prompts
    case 'summarize_group_discussion':
      return QuestionType.RE_TELL_LECTURE
    case 'respond_to_a_situation':
      return QuestionType.REPEAT_SENTENCE
    default:
      return QuestionType.READ_ALOUD
  }
}

function tokenizeWords(text: string): string[] {
  if (!text) return []
  // Normalize and split on non-letter sequences
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\u00C0-\u024F']+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

const FILLERS = new Set([
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you',
  'know',
  'sort',
  'of',
  'kind',
  'kinda',
  'sorta',
  'hmm',
  'mmm',
  'uhh',
  'umm',
])

function computeFillerRate(words: string[]): number {
  const wc = words.length || 1
  let fillerCount = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (FILLERS.has(w)) fillerCount++
    // treat "you know" as a filler phrase
    if (w === 'you' && words[i + 1] === 'know') fillerCount++
    if (w === 'sort' && words[i + 1] === 'of') fillerCount++
    if (w === 'kind' && words[i + 1] === 'of') fillerCount++
  }
  return fillerCount / wc
}

function roughPronunciation(wpm: number, fillerRate: number): number {
  // Favor moderate WPM and low fillers
  let score = 70
  if (wpm < 70) score -= 10
  if (wpm > 170) score -= 10
  score -= Math.min(20, Math.round(fillerRate * 100))
  return score
}

function roughFluency(wpm: number, fillerRate: number): number {
  let score = 72
  if (wpm < 80) score -= 12
  if (wpm > 180) score -= 8
  score -= Math.min(25, Math.round(fillerRate * 120))
  return score
}

function roughContent(wordCount: number, durationMs: number): number {
  const minutes = Math.max(durationMs / 60000, 0.001)
  const density = wordCount / minutes
  // Very rough heuristic targeting 110-160 wpm
  if (wordCount === 0 || durationMs < 500) return 20
  let score = 68
  if (density < 80) score -= 12
  if (density > 190) score -= 10
  return score
}

function clamp0to90(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(90, Math.round(n)))
}
