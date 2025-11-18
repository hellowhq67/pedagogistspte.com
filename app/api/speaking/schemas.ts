import { z } from 'zod'
import type { SpeakingType } from '@/lib/pte/types'

const SPEAKING_TYPES = [
  'read_aloud',
  'repeat_sentence',
  'describe_image',
  'retell_lecture',
  'answer_short_question',
  'summarize_group_discussion',
  'respond_to_a_situation',
] as const

export const SpeakingTypeSchema = z.enum(SPEAKING_TYPES)

export const DifficultyFilterSchema = z
  .enum(['All', 'Easy', 'Medium', 'Hard'])
  .default('All')

export const SpeakingListQuerySchema = z.object({
  type: SpeakingTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default(''),
  difficulty: DifficultyFilterSchema,
  isActive: z.coerce.boolean().default(true),
  sortBy: z.enum(['difficulty', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type SpeakingListQuery = z.infer<typeof SpeakingListQuerySchema>

export const SpeakingIdParamsSchema = z.object({
  id: z.string().min(1),
})

export type SpeakingIdParams = z.infer<typeof SpeakingIdParamsSchema>

export const SpeakingTimingsSchema = z.object({
  prepMs: z.coerce.number().int().nonnegative().optional(),
  recordMs: z.coerce.number().int().positive(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
})

export const SpeakingAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: SpeakingTypeSchema,
  audioUrl: z
    .string()
    .url()
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), {
      message: 'audioUrl must be an http(s) URL',
    }),
  durationMs: z.coerce.number().int().positive().max(120000),
  timings: SpeakingTimingsSchema.partial().optional(),
})

export type SpeakingAttemptBody = z.infer<typeof SpeakingAttemptBodySchema> & {
  type: SpeakingType
}

export function parseListQuery(url: URL): SpeakingListQuery {
  const raw = Object.fromEntries(url.searchParams.entries())
  // zod uses coerce on number/bool fields
  const result = SpeakingListQuerySchema.safeParse(raw)
  if (!result.success) {
    throw new Error(result.error.issues.map((i) => i.message).join('; '))
  }
  return result.data
}

export function normalizeDifficulty(
  d: string | undefined
): 'All' | 'Easy' | 'Medium' | 'Hard' {
  if (!d) return 'All'
  const v = d.toLowerCase()
  if (v === 'all') return 'All'
  if (v === 'easy') return 'Easy'
  if (v === 'medium') return 'Medium'
  if (v === 'hard') return 'Hard'
  return 'All'
}
