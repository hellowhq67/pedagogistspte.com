import 'server-only'
import {
  accuracyTo90,
  buildDeterministicResult,
  clampTo90,
  ScoringResult,
  werTo90,
} from '@/lib/pte/scoring-normalize'
import { TestSection } from '@/lib/pte/types'

/**
 * Deterministic scoring for objective PTE tasks.
 * Coverage:
 * - Reading:
 *   - Multiple Choice (Single)
 *   - Multiple Choice (Multiple) with partial credit
 *   - Fill in the Blanks (Reading)
 *   - Reading & Writing: Fill in the Blanks
 *   - Reorder Paragraphs (pairwise order accuracy)
 * - Listening:
 *   - Write from Dictation (WER + correctness)
 */

export type MCQSinglePayload = {
  selectedOption: string
  correctOption: string
}

export type MCQMultiplePayload = {
  selectedOptions: string[]
  correctOptions: string[]
}

export type FillBlanksPayload = {
  // key: blank index (as string or number), value: user's answer
  answers: Record<string, string>
  // key: blank index (as string or number), value: correct answer
  correct: Record<string, string>
}

export type ReorderParagraphsPayload = {
  // order is 1-based or 0-based indices; we treat values positionally
  userOrder: number[]
  correctOrder: number[]
}

export type WriteFromDictationPayload = {
  targetText: string // ground truth sentence
  userText: string // user's typed sentence
}

export type DeterministicExplanation = {
  metric: 'accuracy' | 'wer' | 'accuracy+wer' | 'pairwise'
  accuracy?: number // 0..1
  wer?: number // 0..inf, typically 0..1
  details?: Record<string, unknown>
  rationale?: string
}

/**
 * Reading: MCQ Single Answer
 */
export function scoreReadingMCQSingle(input: MCQSinglePayload): ScoringResult {
  const correct =
    normalizeAnswer(input.selectedOption) ===
    normalizeAnswer(input.correctOption)
      ? 1
      : 0

  const rationale =
    correct === 1
      ? 'Selected option matches the correct answer.'
      : 'Selected option does not match the correct answer.'
  return buildDeterministicResult({
    section: TestSection.READING,
    accuracy: correct,
    rationale,
    meta: { provider: 'deterministic', task: 'READING_MCQ_SINGLE' },
  })
}

/**
 * Reading: MCQ Multiple Answers with partial credit and penalty:
 * accuracy = max(0, (TP - FP) / |Correct|)
 */
export function scoreReadingMCQMultiple(
  input: MCQMultiplePayload
): ScoringResult {
  const sel = new Set(input.selectedOptions.map(normalizeAnswer))
  const cor = new Set(input.correctOptions.map(normalizeAnswer))

  let tp = 0
  let fp = 0
  for (const s of sel) {
    if (cor.has(s)) tp++
    else fp++
  }
  const denom = Math.max(1, cor.size)
  const raw = Math.max(0, (tp - fp) / denom)
  const acc = Math.min(1, raw)

  const rationale = `Partial credit: TP=${tp}, FP=${fp}, Correct=${cor.size}; accuracy=max(0,(TP-FP)/|Correct|)=${acc.toFixed(
    3
  )}`
  return buildDeterministicResult({
    section: TestSection.READING,
    accuracy: acc,
    rationale,
    meta: { provider: 'deterministic', task: 'READING_MCQ_MULTIPLE', tp, fp, correctCount: cor.size },
  })
}

/**
 * Reading: Fill in the Blanks (Reading) and Reading & Writing FIB
 * Exact match after normalization per blank; equal weight per blank.
 */
export function scoreReadingFillInBlanks(
  input: FillBlanksPayload
): ScoringResult {
  const entries = Object.keys(input.correct)
  const total = Math.max(1, entries.length)
  let correct = 0
  const wrong: Array<{ key: string; user?: string; expected: string }> = []

  for (const k of entries) {
    const expected = input.correct[k]
    const user = input.answers[k]
    if (normalizeAnswer(user || '') === normalizeAnswer(expected || '')) {
      correct++
    } else {
      wrong.push({ key: k, user, expected })
    }
  }

  const acc = correct / total
  const rationale = `Filled correctly ${correct}/${total} blanks.`
  return buildDeterministicResult({
    section: TestSection.READING,
    accuracy: acc,
    rationale,
    meta: { provider: 'deterministic', task: 'READING_FILL_IN_BLANKS', total, correct, wrong },
  })
}

/**
 * Reading: Reorder Paragraphs
 * Score by pairwise order agreement ratio.
 */
export function scoreReadingReorderParagraphs(
  input: ReorderParagraphsPayload
): ScoringResult {
  const u = input.userOrder.slice()
  const c = input.correctOrder.slice()

  const n = Math.min(u.length, c.length)
  if (n <= 1) {
    return buildDeterministicResult({
      section: TestSection.READING,
      accuracy: n === 1 ? 1 : 0,
      rationale:
        n === 1
          ? 'Single paragraph is trivially correct.'
          : 'No paragraphs provided.',
      meta: { provider: 'deterministic', task: 'READING_REORDER', pairs: 0, correctPairs: 0 },
    })
  }

  // Build position map for correct order
  const pos: Record<number, number> = {}
  for (let i = 0; i < n; i++) {
    pos[c[i]] = i
  }

  // Only consider paragraphs that exist in both
  const filteredUser = u.filter((id) => pos[id] !== undefined)

  // Count pairwise agreements in relative order
  let agree = 0
  let totalPairs = 0
  for (let i = 0; i < filteredUser.length; i++) {
    for (let j = i + 1; j < filteredUser.length; j++) {
      totalPairs++
      const a = filteredUser[i]
      const b = filteredUser[j]
      if (pos[a] < pos[b]) agree++
    }
  }

  const acc = totalPairs > 0 ? agree / totalPairs : 0
  const rationale = `Pairwise order accuracy: ${agree}/${totalPairs} correctly ordered pairs.`
  return buildDeterministicResult({
    section: TestSection.READING,
    accuracy: acc,
    rationale,
    meta: { provider: 'deterministic', task: 'READING_REORDER', pairs: totalPairs, correctPairs: agree },
  })
}

/**
 * Listening: Write From Dictation
 * Compute WER (word-error-rate) and convert to 0–90.
 * Also compute correctness as max(0, 1 - WER).
 */
export function scoreListeningWriteFromDictation(
  input: WriteFromDictationPayload
): ScoringResult {
  const refTokens = tokenizeWords(input.targetText)
  const hypTokens = tokenizeWords(input.userText)

  const dist = levenshtein(refTokens, hypTokens)
  const wer = refTokens.length > 0 ? dist / refTokens.length : 1
  const acc = Math.max(0, 1 - wer)

  const rationale = `WER=${wer.toFixed(3)}; accuracy≈${acc.toFixed(
    3
  )} (after normalization, higher is better).`
  // Build deterministic result that includes both correctness and wer score contributions
  const res = buildDeterministicResult({
    section: TestSection.LISTENING,
    accuracy: acc,
    wer,
    rationale,
    meta: { provider: 'deterministic', task: 'LISTENING_WFD', refLen: refTokens.length, edits: dist },
  })

  // Ensure we include a 'wer' subscore representation (0..90 mapping) in subscores for transparency
  // buildDeterministicResult already maps wer to 0..90 if provided, and includes correctness if both supplied.
  return res
}

/** Helpers **/

function normalizeAnswer(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeWords(s: string): string[] {
  const norm = normalizeAnswer(s)
  if (!norm) return []
  return norm.split(' ').filter(Boolean)
}

/**
 * Levenshtein distance on token arrays (substitution, insertion, deletion all cost 1)
 */
function levenshtein(a: string[], b: string[]): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  )

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      )
    }
  }
  return dp[m][n]
}
