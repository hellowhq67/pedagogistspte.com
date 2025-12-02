/**
 * Unit tests for app/actions/score-listening.ts
 * Tests listening task scoring actions
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
  scoreListeningWithAI: jest.fn(),
}))

import { scoreListeningMCQ, scoreWriteFromDictation, scoreSummarizeSpoken } from '@/app/actions/score-listening'

describe('app/actions/score-listening', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('scoreListeningMCQ', () => {
    it('should require authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreListeningMCQ({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOption: 'A',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should validate required fields', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const result = await scoreListeningMCQ({
        sessionId: '',
        questionId: '',
        selectedOption: '',
      })

      expect(result.success).toBe(false)
    })

    it('should score correct answer', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctOption: 'B',
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })

      const result = await scoreListeningMCQ({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOption: 'B',
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(70)
    })

    it('should score incorrect answer', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctOption: 'B',
          }]),
        }),
      })

      const result = await scoreListeningMCQ({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOption: 'A',
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBe(0)
    })
  })

  describe('scoreWriteFromDictation', () => {
    it('should require authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreWriteFromDictation({
        sessionId: 'session-1',
        questionId: 'q1',
        transcription: 'Test transcription',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should validate transcription length', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const result = await scoreWriteFromDictation({
        sessionId: 'session-1',
        questionId: 'q1',
        transcription: '',
      })

      expect(result.success).toBe(false)
    })

    it('should score perfect transcription', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreListeningWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctTranscript: 'The quick brown fox jumps over the lazy dog',
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })
      scoreListeningWithAI.mockResolvedValue({
        overall: 90,
        subscores: {
          accuracy: 90,
          spelling: 90,
          grammar: 90,
        },
        rationale: 'Perfect transcription',
      })

      const result = await scoreWriteFromDictation({
        sessionId: 'session-1',
        questionId: 'q1',
        transcription: 'The quick brown fox jumps over the lazy dog',
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(80)
    })

    it('should score with minor errors', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreListeningWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctTranscript: 'The quick brown fox jumps over the lazy dog',
          }]),
        }),
      })
      scoreListeningWithAI.mockResolvedValue({
        overall: 70,
        subscores: {
          accuracy: 75,
          spelling: 70,
          grammar: 65,
        },
        rationale: 'Minor spelling errors',
      })

      const result = await scoreWriteFromDictation({
        sessionId: 'session-1',
        questionId: 'q1',
        transcription: 'The quick brow fox jumsp over the lazy dog', // Spelling errors
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeLessThan(90)
    })

    it('should handle case differences', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreListeningWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctTranscript: 'Hello World',
          }]),
        }),
      })
      scoreListeningWithAI.mockResolvedValue({
        overall: 85,
        subscores: { accuracy: 85, spelling: 85, grammar: 85 },
        rationale: 'Good',
      })

      const result = await scoreWriteFromDictation({
        sessionId: 'session-1',
        questionId: 'q1',
        transcription: 'hello world',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('scoreSummarizeSpoken', () => {
    it('should require authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreSummarizeSpoken({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: 'Test summary',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should enforce word count limits (50-70 words)', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      // Too short
      const shortResult = await scoreSummarizeSpoken({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: 'Too short summary',
      })
      expect(shortResult.success).toBe(false)

      // Too long
      const longSummary = 'word '.repeat(80)
      const longResult = await scoreSummarizeSpoken({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: longSummary,
      })
      expect(longResult.success).toBe(false)
    })

    it('should score valid summary', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreListeningWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            audioTranscript: 'Original audio transcript',
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })
      scoreListeningWithAI.mockResolvedValue({
        overall: 75,
        subscores: {
          content: 80,
          form: 75,
          grammar: 70,
          vocabulary: 75,
        },
        rationale: 'Good summary',
      })

      const summary = 'This is a comprehensive summary. '.repeat(12) // ~60 words
      const result = await scoreSummarizeSpoken({
        sessionId: 'session-1',
        questionId: 'q1',
        summary,
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(0)
    })

    it('should accept 50-70 word range', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      const { scoreListeningWithAI } = require('@/lib/ai/scoring')

      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'q1', audioTranscript: 'Transcript' }]),
        }),
      })
      scoreListeningWithAI.mockResolvedValue({
        overall: 70,
        subscores: { content: 70, form: 70, grammar: 70, vocabulary: 70 },
        rationale: 'Good',
      })

      // 50 words (minimum)
      const minSummary = 'word '.repeat(50).trim()
      const minResult = await scoreSummarizeSpoken({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: minSummary,
      })
      expect(minResult.success).toBe(true)

      // 70 words (maximum)
      const maxSummary = 'word '.repeat(70).trim()
      const maxResult = await scoreSummarizeSpoken({
        sessionId: 'session-1',
        questionId: 'q1',
        summary: maxSummary,
      })
      expect(maxResult.success).toBe(true)
    })
  })
})