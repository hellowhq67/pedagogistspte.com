/**
 * Unit tests for app/actions/score-writing.ts
 * Tests writing task scoring actions (Essay and Summarize)
 */

jest.mock('server-only', () => ({}))
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}))
jest.mock('@/lib/auth/auth', () => ({
  auth: jest.fn(),
}))
jest.mock('@/lib/ai/scoring', () => ({
  scoreWritingWithAI: jest.fn(),
}))

import { scoreEssay, scoreSummarizeWritten } from '@/app/actions/score-writing'

describe('app/actions/score-writing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('scoreEssay', () => {
    it('should require authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreEssay({
        sessionId: 'session-1',
        questionId: 'q1',
        essay: 'Test essay content',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should validate essay length minimum', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const result = await scoreEssay({
        sessionId: 'session-1',
        questionId: 'q1',
        essay: 'Too short',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('word')
    })

    it('should validate essay length maximum', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const longEssay = 'word '.repeat(400) // Over 300 word limit
      const result = await scoreEssay({
        sessionId: 'session-1',
        questionId: 'q1',
        essay: longEssay,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('word')
    })

    it('should score valid essay with AI', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreWritingWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            prompt: 'Essay prompt',
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })
      scoreWritingWithAI.mockResolvedValue({
        overall: 75,
        subscores: {
          content: 80,
          form: 70,
          grammar: 75,
          vocabulary: 75,
        },
        rationale: 'Good essay',
      })

      const essay = 'This is a well-written essay. '.repeat(20) // ~200 words
      const result = await scoreEssay({
        sessionId: 'session-1',
        questionId: 'q1',
        essay,
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBe(75)
      expect(scoreWritingWithAI).toHaveBeenCalled()
    })

    it('should handle AI scoring errors', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreWritingWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'q1', prompt: 'Prompt' }]),
        }),
      })
      scoreWritingWithAI.mockRejectedValue(new Error('AI Error'))

      const essay = 'Valid essay content. '.repeat(20)
      const result = await scoreEssay({
        sessionId: 'session-1',
        questionId: 'q1',
        essay,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('scoreSummarizeWritten', () => {
    it('should require authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreSummarizeWritten({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: 'Test summary',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should enforce word count limits', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      // Too short (< 5 words)
      const shortResult = await scoreSummarizeWritten({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: 'Too short',
      })
      expect(shortResult.success).toBe(false)

      // Too long (> 75 words)
      const longSummary = 'word '.repeat(80)
      const longResult = await scoreSummarizeWritten({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: longSummary,
      })
      expect(longResult.success).toBe(false)
    })

    it('should score valid summary', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreWritingWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            passage: 'Original passage',
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })
      scoreWritingWithAI.mockResolvedValue({
        overall: 80,
        subscores: {
          content: 85,
          form: 80,
          grammar: 75,
          vocabulary: 80,
        },
        rationale: 'Excellent summary',
      })

      const summary = 'This is a concise summary of the main points. '.repeat(5) // ~40 words
      const result = await scoreSummarizeWritten({
        sessionId: 'session-1',
        questionId: 'q1',
        summary,
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(0)
    })

    it('should validate word count between 5 and 75', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreWritingWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'q1', passage: 'Passage' }]),
        }),
      })
      scoreWritingWithAI.mockResolvedValue({
        overall: 70,
        subscores: { content: 70, form: 70, grammar: 70, vocabulary: 70 },
        rationale: 'Good',
      })

      // Exactly 5 words (minimum)
      const minResult = await scoreSummarizeWritten({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: 'One two three four five',
      })
      expect(minResult.success).toBe(true)

      // 75 words (maximum)
      const maxSummary = 'word '.repeat(75).trim()
      const maxResult = await scoreSummarizeWritten({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: maxSummary,
      })
      expect(maxResult.success).toBe(true)
    })
  })
})