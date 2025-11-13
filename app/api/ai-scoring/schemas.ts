import { z } from 'zod'
import { TestSection } from '@/lib/pte/types'

export const SectionSchema = z.enum([
  'SPEAKING',
  'WRITING',
  'READING',
  'LISTENING',
])

export type Section = z.infer<typeof SectionSchema>

export const BaseScoreRequestSchema = z.object({
  section: SectionSchema,
  questionType: z.string().min(1, 'questionType is required'),
  attemptId: z.string().optional(),
  userId: z.string().optional(),
  includeRationale: z.coerce.boolean().optional().default(false),
  // payload is task-specific; keep flexible but bounded in size roughly
  payload: z.any(),
  providerPriority: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => {
      if (!v) return undefined
      if (Array.isArray(v)) return v
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }),
  timeoutMs: z.coerce.number().int().positive().optional(),
})

export type BaseScoreRequest = z.infer<typeof BaseScoreRequestSchema>

export const SpeakingScoreRequestSchema = BaseScoreRequestSchema.extend({
  section: z.literal('SPEAKING'),
  payload: z
    .object({
      // either transcript or audioUrl (transcription will run if configured)
      transcript: z.string().optional(),
      audioUrl: z.string().url().optional(),
      referenceText: z.string().optional(),
    })
    .passthrough(),
})

export const WritingScoreRequestSchema = BaseScoreRequestSchema.extend({
  section: z.literal('WRITING'),
  payload: z
    .object({
      text: z.string().min(1),
      prompt: z.string().optional(),
    })
    .passthrough(),
})

export const ReadingScoreRequestSchema = BaseScoreRequestSchema.extend({
  section: z.literal('READING'),
  payload: z
    .object({
      // for deterministic tasks
      selectedOption: z.string().optional(),
      selectedOptions: z.array(z.string()).optional(),
      correctOption: z.string().optional(),
      correctOptions: z.array(z.string()).optional(),
      answers: z.record(z.string(), z.string()).optional(),
      correct: z.record(z.string(), z.string()).optional(),
      order: z.array(z.number().int()).optional(),
      userOrder: z.array(z.number().int()).optional(),
      correctOrder: z.array(z.number().int()).optional(),
      // for explanation-only mode
      question: z.string().optional(),
      options: z.array(z.string()).optional(),
    })
    .passthrough(),
})

export const ListeningScoreRequestSchema = BaseScoreRequestSchema.extend({
  section: z.literal('LISTENING'),
  payload: z
    .object({
      // WFD deterministic
      targetText: z.string().optional(),
      userText: z.string().optional(),
      // explanation context
      transcript: z.string().optional(),
    })
    .passthrough(),
})

export const UnifiedScoreRequestSchema = z.union([
  SpeakingScoreRequestSchema,
  WritingScoreRequestSchema,
  ReadingScoreRequestSchema,
  ListeningScoreRequestSchema,
])

export type UnifiedScoreRequest = z.infer<typeof UnifiedScoreRequestSchema>

export function parseScoreRequest(body: unknown): UnifiedScoreRequest {
  const res = UnifiedScoreRequestSchema.safeParse(body)
  if (!res.success) {
    const message = res.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    const err: any = new Error(message)
    err.code = 'invalid_request'
    throw err
  }
  return res.data
}

export function toTestSection(section: Section): TestSection {
  switch (section) {
    case 'SPEAKING':
      return TestSection.SPEAKING
    case 'WRITING':
      return TestSection.WRITING
    case 'READING':
      return TestSection.READING
    case 'LISTENING':
      return TestSection.LISTENING
    default:
      return TestSection.READING
  }
}

/**
 * Error helpers and shapes
 */
export type ApiErrorShape = {
  error: { code: string; message: string }
  meta?: Record<string, any>
}

// Redact secrets if ever echoed (prevent accidents)
export function redactEnv(v: string | undefined): string | undefined {
  if (!v) return v
  if (v.length <= 8) return '***'
  return v.slice(0, 3) + '***' + v.slice(-2)
}

export function buildError(
  code: string,
  message: string,
  meta?: Record<string, any>
): ApiErrorShape {
  return { error: { code, message }, meta }
}
