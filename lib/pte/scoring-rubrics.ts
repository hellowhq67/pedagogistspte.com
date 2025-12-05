import 'server-only'
import { TestSection } from '@/lib/pte/types'

export type SpeakingWeights = {
  content: number
  pronunciation: number
  fluency: number
  grammar: number
  vocabulary: number
}

export type WritingWeights = {
  content: number
  structure: number
  coherence: number
  grammar: number
  vocabulary: number
  spelling: number
}

export type ReadingWeights = {
  correctness: number
}

export type ListeningWeights = {
  correctness: number
  wer: number // used for WFD-like tasks
}

export const DEFAULT_WEIGHTS: Record<TestSection, Record<string, number>> = {
  [TestSection.SPEAKING]: {
    content: 0.4,
    pronunciation: 0.3,
    fluency: 0.2,
    grammar: 0.05,
    vocabulary: 0.05,
  } satisfies SpeakingWeights as Record<string, number>,
  [TestSection.WRITING]: {
    content: 0.35,
    structure: 0.15,
    coherence: 0.15,
    grammar: 0.15,
    vocabulary: 0.1,
    spelling: 0.1,
  } satisfies WritingWeights as Record<string, number>,
  [TestSection.READING]: {
    correctness: 1.0,
  } satisfies ReadingWeights as Record<string, number>,
  [TestSection.LISTENING]: {
    correctness: 0.7,
    wer: 0.3,
  } satisfies ListeningWeights as Record<string, number>,
}

export type PromptPair = {
  system: string
  user: string
}

/**
 * Speaking rubric and prompt builder
 */
export function buildSpeakingPrompt(params: {
  questionType: string
  transcript: string
  referenceText?: string
  includeRationale?: boolean
}): PromptPair {
  const { questionType, transcript, referenceText, includeRationale } = params

  const system = [
    'You are a certified Pearson PTE Academic examiner.',
    'Score the SPEAKING response strictly per PTE criteria on a 0–90 scale for each dimension.',
    'Return ONLY strict JSON (no markdown) with keys: overall, content, pronunciation, fluency, grammar, vocabulary, rationale.',
    'Each dimension must be 0–90 integer. overall is weighted per PTE norms.',
    'Be concise. Keep rationale under 5 sentences.',
  ].join(' ')

  const user = [
    `Task: ${questionType}`,
    referenceText
      ? `Reference/Prompt Text: ${referenceText}`
      : 'No reference text provided.',
    `Transcript: """${transcript}"""`,
    '',
    'JSON schema:',
    '{',
    '  "overall": number,',
    '  "content": number,',
    '  "pronunciation": number,',
    '  "fluency": number,',
    '  "grammar": number,',
    '  "vocabulary": number,',
    `  "rationale": "${includeRationale ? 'string' : ''}"`,
    '}',
  ].join('\n')

  return { system, user }
}

/**
 * Writing rubric and prompt builder
 */
export function buildWritingPrompt(params: {
  questionType: string
  text: string
  prompt?: string
  includeRationale?: boolean
}): PromptPair {
  const { questionType, text, prompt, includeRationale } = params

  const system = [
    'You are a certified Pearson PTE Academic examiner.',
    'Score the WRITING response strictly per PTE criteria on a 0–90 scale for each dimension.',
    'Return ONLY strict JSON (no markdown) with keys: overall, content, structure, coherence, grammar, vocabulary, spelling, rationale.',
    'Each dimension must be 0–90 integer. overall should reflect PTE scaling.',
  ].join(' ')

  const user = [
    `Task: ${questionType}`,
    prompt ? `Prompt: """${prompt}"""` : 'No prompt text provided.',
    `Student Response: """${text}"""`,
    '',
    'JSON schema:',
    '{',
    '  "overall": number,',
    '  "content": number,',
    '  "structure": number,',
    '  "coherence": number,',
    '  "grammar": number,',
    '  "vocabulary": number,',
    '  "spelling": number,',
    `  "rationale": "${includeRationale ? 'string' : ''}"`,
    '}',
  ].join('\n')

  return { system, user }
}

/**
 * Reading explanation prompt builder (when we want LLM rationale only)
 */
export function buildReadingExplanationPrompt(params: {
  questionType: string
  question: string
  options?: string[]
  correct: string[] // correct option ids or texts
  userSelected: string[] // user option ids or texts
}): PromptPair {
  const { questionType, question, options, correct, userSelected } = params
  const system = [
    'You are a PTE Reading coach. Explain succinctly why the correct answers are correct.',
    'Keep response under 5 sentences. No personal data. Neutral tone.',
    'Return ONLY JSON with key: rationale (string, 1–3 sentences).',
  ].join(' ')
  const user = [
    `Task: ${questionType}`,
    `Question: """${question}"""`,
    options && options.length
      ? `Options: ${JSON.stringify(options)}`
      : 'Options: []',
    `Correct: ${JSON.stringify(correct)}`,
    `UserSelected: ${JSON.stringify(userSelected)}`,
    '',
    'JSON schema:',
    '{ "rationale": "string" }',
  ].join('\n')
  return { system, user }
}

/**
 * Listening explanation prompt builder (including for WFD)
 */
export function buildListeningExplanationPrompt(params: {
  questionType: string
  transcript?: string // reference transcript for audio
  targetText?: string // for WFD
  userText?: string // for WFD
}): PromptPair {
  const { questionType, transcript, targetText, userText } = params
  const system = [
    'You are a PTE Listening coach. Provide a brief explanation and key differences.',
    'Return ONLY JSON with key: rationale.',
    'Keep under 4 sentences.',
  ].join(' ')
  const user = [
    `Task: ${questionType}`,
    transcript ? `Audio Transcript: """${transcript}"""` : '',
    targetText ? `Target Text: """${targetText}"""` : '',
    userText ? `User Text: """${userText}"""` : '',
    '',
    'JSON schema:',
    '{ "rationale": "string" }',
  ].join('\n')
  return { system, user }
}

/**
 * Map default weights by section for orchestrator
 */
export function getDefaultWeights(
  section: TestSection
): Record<string, number> {
  return DEFAULT_WEIGHTS[section] ?? {}
}
