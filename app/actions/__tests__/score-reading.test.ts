/**
 * Unit tests for app/actions/score-reading.ts
 * Tests reading task scoring actions
 */

// Mock dependencies
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

import { scoreReadingMCQSingle, scoreReadingMCQMultiple, scoreReadingFillBlanks } from '@/app/actions/score-reading'

describe('app/actions/score-reading', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('scoreReadingMCQSingle', () => {
    it('should handle missing authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreReadingMCQSingle({
        sessionId: 'test-session',
        questionId: 'q1',
        selectedOption: 'A',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should validate required fields', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const result = await scoreReadingMCQSingle({
        sessionId: '',
        questionId: '',
        selectedOption: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should accept valid single choice input', async () => {
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

      const result = await scoreReadingMCQSingle({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOption: 'B',
      })

      expect(result.success).toBe(true)
    })

    it('should handle incorrect answer', async () => {
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

      const result = await scoreReadingMCQSingle({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOption: 'A',
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeLessThan(50)
    })

    it('should handle database errors gracefully', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      })

      const result = await scoreReadingMCQSingle({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOption: 'A',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('scoreReadingMCQMultiple', () => {
    it('should handle missing authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreReadingMCQMultiple({
        sessionId: 'test-session',
        questionId: 'q1',
        selectedOptions: ['A', 'B'],
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should validate array input', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const result = await scoreReadingMCQMultiple({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOptions: [],
      })

      expect(result.success).toBe(false)
    })

    it('should accept multiple correct selections', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctOptions: ['A', 'C'],
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })

      const result = await scoreReadingMCQMultiple({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOptions: ['A', 'C'],
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(70)
    })

    it('should handle partial credit scoring', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctOptions: ['A', 'C', 'D'],
          }]),
        }),
      })

      const result = await scoreReadingMCQMultiple({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOptions: ['A', 'C'], // 2 out of 3 correct
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(0)
      expect(result.data?.overall).toBeLessThan(90)
    })

    it('should penalize incorrect selections', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctOptions: ['A', 'C'],
          }]),
        }),
      })

      const result = await scoreReadingMCQMultiple({
        sessionId: 'session-1',
        questionId: 'q1',
        selectedOptions: ['A', 'B', 'C'], // One wrong selection
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeLessThan(90)
    })
  })

  describe('scoreReadingFillBlanks', () => {
    it('should handle missing authentication', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue(null)

      const result = await scoreReadingFillBlanks({
        sessionId: 'test-session',
        questionId: 'q1',
        answers: { '1': 'answer' },
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })

    it('should validate answers object', async () => {
      const { auth } = require('@/lib/auth/auth')
      auth.mockResolvedValue({ user: { id: 'user-1' } })

      const result = await scoreReadingFillBlanks({
        sessionId: 'session-1',
        questionId: 'q1',
        answers: {},
      })

      expect(result.success).toBe(false)
    })

    it('should score all correct answers', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctAnswers: { '1': 'answer1', '2': 'answer2' },
          }]),
        }),
      })
      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })

      const result = await scoreReadingFillBlanks({
        sessionId: 'session-1',
        questionId: 'q1',
        answers: { '1': 'answer1', '2': 'answer2' },
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThanOrEqual(80)
    })

    it('should score partially correct answers', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctAnswers: { '1': 'answer1', '2': 'answer2', '3': 'answer3' },
          }]),
        }),
      })

      const result = await scoreReadingFillBlanks({
        sessionId: 'session-1',
        questionId: 'q1',
        answers: { '1': 'answer1', '2': 'wrong', '3': 'answer3' },
      })

      expect(result.success).toBe(true)
      expect(result.data?.overall).toBeGreaterThan(0)
      expect(result.data?.overall).toBeLessThan(90)
    })

    it('should handle case-insensitive matching', async () => {
      const { auth } = require('@/lib/auth/auth')
      const { db } = require('@/lib/db/drizzle')
      
      auth.mockResolvedValue({ user: { id: 'user-1' } })
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 'q1',
            correctAnswers: { '1': 'Answer' },
          }]),
        }),
      })

      const result = await scoreReadingFillBlanks({
        sessionId: 'session-1',
        questionId: 'q1',
        answers: { '1': 'answer' },
      })

      expect(result.success).toBe(true)
    })
  })
})