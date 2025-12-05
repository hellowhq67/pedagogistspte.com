import { z } from 'zod'

const READING_TYPES = [
  'multiple_choice_single',
  'multiple_choice_multiple',
  'reorder_paragraphs',
  'fill_in_blanks',
  'reading_writing_fill_blanks',
] as const

export const ReadingQuestionTypeSchema = z.enum(READING_TYPES)

export type ReadingQuestionType = z.infer<typeof ReadingQuestionTypeSchema>

export const DifficultyFilterSchema = z
  .enum(['All', 'Easy', 'Medium', 'Hard'])
  .default('All')

export const ReadingListQuerySchema = z.object({
  type: ReadingQuestionTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default(''),
  difficulty: DifficultyFilterSchema,
  isActive: z.coerce.boolean().default(true),
  sortBy: z.enum(['difficulty', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ReadingListQuery = z.infer<typeof ReadingListQuerySchema>

export const ReadingIdParamsSchema = z.object({
  id: z.string().min(1),
})

export type ReadingIdParams = z.infer<typeof ReadingIdParamsSchema>

// Response schemas for different question types
export const MultipleChoiceSingleResponseSchema = z.object({
  selectedOption: z.string().min(1),
})

export const MultipleChoiceMultipleResponseSchema = z.object({
  selectedOptions: z.array(z.string()).min(1),
})

export const ReorderParagraphsResponseSchema = z.object({
  order: z.array(z.number().int().min(1)),
})

export const FillInBlanksResponseSchema = z.object({
  answers: z.record(z.string(), z.string()), // key: blank index, value: answer
})

export const ReadingWritingFillBlanksResponseSchema = z.object({
  answers: z.record(z.string(), z.string()), // key: blank index, value: answer
})

// Union of all possible response types
export const ReadingAttemptResponseSchema = z.union([
  MultipleChoiceSingleResponseSchema,
  MultipleChoiceMultipleResponseSchema,
  ReorderParagraphsResponseSchema,
  FillInBlanksResponseSchema,
  ReadingWritingFillBlanksResponseSchema,
])

export const ReadingAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: ReadingQuestionTypeSchema,
  userResponse: ReadingAttemptResponseSchema,
  timeTaken: z.coerce.number().int().positive().max(3600), // max 1 hour
})

export type ReadingAttemptBody = z.infer<typeof ReadingAttemptBodySchema>

export function parseListQuery(url: URL): ReadingListQuery {
  const raw = Object.fromEntries(url.searchParams.entries())
  const result = ReadingListQuerySchema.safeParse(raw)
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
