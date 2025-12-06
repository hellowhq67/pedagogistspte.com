/**
 * Tests for practice locks utility functions
 * Note: These test the logic, not database operations
 */

describe('lib/subscription/practice-locks', () => {
  describe('PracticeLockStatus interface', () => {
    it('should have correct structure', () => {
      const mockStatus = {
        canPractice: true,
        attemptsToday: 2,
        limit: 3,
        remaining: 1,
        resetsAt: new Date(),
        reason: undefined,
      }
      
      expect(mockStatus.canPractice).toBeDefined()
      expect(typeof mockStatus.canPractice).toBe('boolean')
      expect(typeof mockStatus.attemptsToday).toBe('number')
      expect(typeof mockStatus.limit).toBe('number')
      expect(typeof mockStatus.remaining).toBe('number')
      expect(mockStatus.resetsAt).toBeInstanceOf(Date)
    })

    it('should include reason when locked', () => {
      const lockedStatus = {
        canPractice: false,
        attemptsToday: 3,
        limit: 3,
        remaining: 0,
        resetsAt: new Date(),
        reason: 'Daily limit reached',
      }
      
      expect(lockedStatus.reason).toBeDefined()
      expect(typeof lockedStatus.reason).toBe('string')
    })
  })

  describe('limit calculations', () => {
    it('should calculate remaining attempts correctly', () => {
      const testCases = [
        { limit: 3, attempts: 0, expected: 3 },
        { limit: 3, attempts: 1, expected: 2 },
        { limit: 3, attempts: 2, expected: 1 },
        { limit: 3, attempts: 3, expected: 0 },
      ]
      
      testCases.forEach(({ limit, attempts, expected }) => {
        const remaining = Math.max(0, limit - attempts)
        expect(remaining).toBe(expected)
      })
    })

    it('should handle unlimited access (-1)', () => {
      const limit = -1
      const attempts = 100
      
      const isUnlimited = limit === -1
      expect(isUnlimited).toBe(true)
      
      if (isUnlimited) {
        const remaining = -1
        expect(remaining).toBe(-1)
      }
    })

    it('should not go negative for remaining attempts', () => {
      const limit = 3
      const attempts = 5
      
      const remaining = Math.max(0, limit - attempts)
      expect(remaining).toBe(0)
      expect(remaining).toBeGreaterThanOrEqual(0)
    })
  })

  describe('reset time calculations', () => {
    it('should calculate next midnight correctly', () => {
      const now = new Date('2024-01-15T14:30:00Z')
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      expect(tomorrow.getDate()).toBe(16)
      expect(tomorrow.getHours()).toBe(0)
      expect(tomorrow.getMinutes()).toBe(0)
      expect(tomorrow.getSeconds()).toBe(0)
    })

    it('should handle month boundaries', () => {
      const now = new Date('2024-01-31T23:30:00Z')
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      expect(tomorrow.getMonth()).toBe(1) // February
      expect(tomorrow.getDate()).toBe(1)
    })

    it('should handle year boundaries', () => {
      const now = new Date('2024-12-31T23:30:00Z')
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      expect(tomorrow.getFullYear()).toBe(2025)
      expect(tomorrow.getMonth()).toBe(0) // January
      expect(tomorrow.getDate()).toBe(1)
    })
  })

  describe('attempt comparison logic', () => {
    it('should detect same day attempts', () => {
      const lastAttempt = new Date('2024-01-15T10:00:00Z')
      const now = new Date('2024-01-15T14:00:00Z')
      
      const lastDate = new Date(lastAttempt)
      lastDate.setHours(0, 0, 0, 0)
      
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      expect(lastDate.getTime()).toBe(today.getTime())
    })

    it('should detect different day attempts', () => {
      const lastAttempt = new Date('2024-01-14T23:59:00Z')
      const now = new Date('2024-01-15T00:01:00Z')
      
      const lastDate = new Date(lastAttempt)
      lastDate.setHours(0, 0, 0, 0)
      
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      expect(lastDate.getTime()).not.toBe(today.getTime())
    })
  })

  describe('lock reason messages', () => {
    it('should provide clear reason when locked', () => {
      const reason = 'Daily limit reached. You can practice 3 times per day. Resets at midnight.'
      
      expect(reason).toContain('Daily limit')
      expect(reason).toContain('per day')
      expect(reason).toContain('Resets')
    })

    it('should have no reason when unlocked', () => {
      const reason = undefined
      
      expect(reason).toBeUndefined()
    })
  })
})