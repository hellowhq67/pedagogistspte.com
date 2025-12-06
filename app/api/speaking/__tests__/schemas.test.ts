import {
  SpeakingTypeSchema,
  DifficultyFilterSchema,
  SpeakingListQuerySchema,
  SpeakingIdParamsSchema,
  SpeakingTimingsSchema,
  SpeakingAttemptBodySchema,
} from '../schemas'
import { z } from 'zod'

describe('app/api/speaking/schemas', () => {
  describe('SpeakingTypeSchema', () => {
    it('should accept valid speaking types', () => {
      const validTypes = [
        'read_aloud',
        'repeat_sentence',
        'describe_image',
        'retell_lecture',
        'answer_short_question',
        'summarize_group_discussion',
        'respond_to_a_situation',
      ]

      validTypes.forEach(type => {
        expect(() => SpeakingTypeSchema.parse(type)).not.toThrow()
      })
    })

    it('should reject invalid speaking types', () => {
      const invalidTypes = [
        'invalid_type',
        'writing',
        '',
        null,
        undefined,
        123,
      ]

      invalidTypes.forEach(type => {
        expect(() => SpeakingTypeSchema.parse(type)).toThrow()
      })
    })
  })

  describe('DifficultyFilterSchema', () => {
    it('should accept valid difficulty levels', () => {
      const validLevels = ['All', 'Easy', 'Medium', 'Hard']

      validLevels.forEach(level => {
        expect(() => DifficultyFilterSchema.parse(level)).not.toThrow()
      })
    })

    it('should default to "All" when not provided', () => {
      const result = DifficultyFilterSchema.parse(undefined)
      expect(result).toBe('All')
    })

    it('should reject invalid difficulty levels', () => {
      const invalidLevels = ['Invalid', 'easy', 'HARD', null, 123]

      invalidLevels.forEach(level => {
        expect(() => DifficultyFilterSchema.parse(level)).toThrow()
      })
    })
  })

  describe('SpeakingListQuerySchema', () => {
    it('should parse valid query with all fields', () => {
      const validQuery = {
        type: 'read_aloud',
        page: 2,
        pageSize: 50,
        search: 'test query',
        difficulty: 'Medium',
        isActive: true,
        sortBy: 'difficulty',
        sortOrder: 'asc',
      }

      const result = SpeakingListQuerySchema.parse(validQuery)
      expect(result).toEqual(validQuery)
    })

    it('should apply default values for missing fields', () => {
      const minimalQuery = {
        type: 'read_aloud',
      }

      const result = SpeakingListQuerySchema.parse(minimalQuery)
      
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
      expect(result.search).toBe('')
      expect(result.difficulty).toBe('All')
      expect(result.isActive).toBe(true)
      expect(result.sortBy).toBe('createdAt')
      expect(result.sortOrder).toBe('desc')
    })

    it('should coerce string numbers to integers', () => {
      const queryWithStrings = {
        type: 'read_aloud',
        page: '3',
        pageSize: '10',
      }

      const result = SpeakingListQuerySchema.parse(queryWithStrings as any)
      
      expect(result.page).toBe(3)
      expect(result.pageSize).toBe(10)
    })

    it('should enforce minimum page value', () => {
      const invalidQuery = {
        type: 'read_aloud',
        page: 0,
      }

      expect(() => SpeakingListQuerySchema.parse(invalidQuery)).toThrow()
    })

    it('should enforce maximum pageSize value', () => {
      const invalidQuery = {
        type: 'read_aloud',
        pageSize: 101,
      }

      expect(() => SpeakingListQuerySchema.parse(invalidQuery)).toThrow()
    })

    it('should trim search string', () => {
      const queryWithSpaces = {
        type: 'read_aloud',
        search: '  test query  ',
      }

      const result = SpeakingListQuerySchema.parse(queryWithSpaces)
      expect(result.search).toBe('test query')
    })
  })

  describe('SpeakingIdParamsSchema', () => {
    it('should accept valid ID', () => {
      const validParams = { id: 'abc123' }
      const result = SpeakingIdParamsSchema.parse(validParams)
      expect(result.id).toBe('abc123')
    })

    it('should accept UUID format', () => {
      const validParams = { id: '123e4567-e89b-12d3-a456-426614174000' }
      expect(() => SpeakingIdParamsSchema.parse(validParams)).not.toThrow()
    })

    it('should reject empty ID', () => {
      const invalidParams = { id: '' }
      expect(() => SpeakingIdParamsSchema.parse(invalidParams)).toThrow()
    })
  })

  describe('SpeakingTimingsSchema', () => {
    it('should accept valid timings', () => {
      const validTimings = {
        prepMs: 30000,
        recordMs: 40000,
        startAt: '2024-01-01T00:00:00Z',
        endAt: '2024-01-01T00:01:10Z',
      }

      const result = SpeakingTimingsSchema.parse(validTimings)
      expect(result).toEqual(validTimings)
    })

    it('should allow optional prepMs', () => {
      const timingsWithoutPrep = {
        recordMs: 40000,
      }

      const result = SpeakingTimingsSchema.parse(timingsWithoutPrep)
      expect(result.prepMs).toBeUndefined()
      expect(result.recordMs).toBe(40000)
    })

    it('should enforce positive recordMs', () => {
      const invalidTimings = {
        recordMs: 0,
      }

      expect(() => SpeakingTimingsSchema.parse(invalidTimings)).toThrow()
    })
  })
})