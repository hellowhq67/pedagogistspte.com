import { describe, it, expect } from 'vitest'
import { formatScoreByModule as utilsFormat } from './utils'
import { formatScoreByModule as queriesFormat } from './queries-enhanced'

/**
 * Integration tests to verify the two implementations of formatScoreByModule
 * have different behaviors and that components are using the correct one.
 */
describe('formatScoreByModule - Integration Tests', () => {
  describe('implementation differences', () => {
    it('should have different implementations in utils vs queries-enhanced', () => {
      // The utils version uses ranges for speaking/listening
      expect(utilsFormat(75, 'speaking')).toBe('75-80')
      
      // The queries-enhanced version uses /90 format
      expect(queriesFormat(75, 'speaking')).toBe('75/90')
      
      // They produce different outputs
      expect(utilsFormat(75, 'speaking')).not.toBe(queriesFormat(75, 'speaking'))
    })

    it('should format speaking scores differently', () => {
      const score = 73
      
      // utils.ts: range format
      expect(utilsFormat(score, 'speaking')).toBe('70-75')
      
      // queries-enhanced.ts: /90 format
      expect(queriesFormat(score, 'speaking')).toBe('73/90')
    })

    it('should format listening scores differently', () => {
      const score = 68
      
      // utils.ts: range format
      expect(utilsFormat(score, 'listening')).toBe('65-70')
      
      // queries-enhanced.ts: percentage format
      expect(queriesFormat(score, 'listening')).toBe('68%')
    })

    it('should format reading scores differently', () => {
      const score = 85.5
      
      // utils.ts: exact score
      expect(utilsFormat(score, 'reading')).toBe('85.5')
      
      // queries-enhanced.ts: percentage format
      expect(queriesFormat(score, 'reading')).toBe('86%') // rounds
    })

    it('should format writing scores differently', () => {
      const score = 77.8
      
      // utils.ts: exact score
      expect(utilsFormat(score, 'writing')).toBe('77.8')
      
      // queries-enhanced.ts: /90 format
      expect(queriesFormat(score, 'writing')).toBe('78/90') // rounds
    })
  })

  describe('client-safe vs server-side usage', () => {
    it('utils.formatScoreByModule should be client-safe (no null undefined issues)', () => {
      // utils version handles undefined explicitly
      expect(utilsFormat(undefined as any, 'speaking')).toBe('N/A')
      expect(utilsFormat(null, 'speaking')).toBe('N/A')
    })

    it('queries-enhanced.formatScoreByModule should handle null', () => {
      // queries-enhanced version handles null but not undefined in the same way
      expect(queriesFormat(null, 'speaking')).toBe('N/A')
    })
  })

  describe('rounding behavior differences', () => {
    it('should handle decimal rounding differently', () => {
      const score = 78.6
      
      // utils: preserves decimals for reading/writing, uses floor for speaking/listening
      expect(utilsFormat(score, 'reading')).toBe('78.6')
      expect(utilsFormat(score, 'speaking')).toBe('75-80')
      
      // queries-enhanced: always rounds
      expect(queriesFormat(score, 'reading')).toBe('79%')
      expect(queriesFormat(score, 'speaking')).toBe('79/90')
    })
  })

  describe('edge case comparisons', () => {
    it('should handle zero scores differently', () => {
      expect(utilsFormat(0, 'speaking')).toBe('0-5')
      expect(queriesFormat(0, 'speaking')).toBe('0/90')
    })

    it('should handle maximum scores differently', () => {
      expect(utilsFormat(90, 'speaking')).toBe('90-95')
      expect(queriesFormat(90, 'speaking')).toBe('90/90')
    })

    it('should handle very high scores', () => {
      expect(utilsFormat(100, 'reading')).toBe('100')
      expect(queriesFormat(100, 'reading')).toBe('100%')
    })
  })

  describe('module-specific behavior comparison', () => {
    it('should verify speaking uses different formats', () => {
      const testScores = [23, 47, 68, 89]
      
      testScores.forEach(score => {
        const utilsResult = utilsFormat(score, 'speaking')
        const queriesResult = queriesFormat(score, 'speaking')
        
        // utils: always range format (XX-YY)
        expect(utilsResult).toMatch(/^\d+-\d+$/)
        
        // queries-enhanced: always /90 format
        expect(queriesResult).toMatch(/^\d+\/90$/)
        
        expect(utilsResult).not.toBe(queriesResult)
      })
    })

    it('should verify listening uses different formats', () => {
      const testScores = [15, 42, 75, 88]
      
      testScores.forEach(score => {
        const utilsResult = utilsFormat(score, 'listening')
        const queriesResult = queriesFormat(score, 'listening')
        
        // utils: always range format (XX-YY)
        expect(utilsResult).toMatch(/^\d+-\d+$/)
        
        // queries-enhanced: always percentage format
        expect(queriesResult).toMatch(/^\d+%$/)
        
        expect(utilsResult).not.toBe(queriesResult)
      })
    })

    it('should verify reading uses different formats', () => {
      const testScores = [25.5, 50.3, 75.7, 90.1]
      
      testScores.forEach(score => {
        const utilsResult = utilsFormat(score, 'reading')
        const queriesResult = queriesFormat(score, 'reading')
        
        // utils: exact score (may have decimals)
        expect(utilsResult).toBe(score.toString())
        
        // queries-enhanced: percentage format (rounded)
        expect(queriesResult).toMatch(/^\d+%$/)
        
        expect(utilsResult).not.toBe(queriesResult)
      })
    })

    it('should verify writing uses different formats', () => {
      const testScores = [30.2, 55.8, 70.5, 85.9]
      
      testScores.forEach(score => {
        const utilsResult = utilsFormat(score, 'writing')
        const queriesResult = queriesFormat(score, 'writing')
        
        // utils: exact score (may have decimals)
        expect(utilsResult).toBe(score.toString())
        
        // queries-enhanced: /90 format (rounded)
        expect(queriesResult).toMatch(/^\d+\/90$/)
        
        expect(utilsResult).not.toBe(queriesResult)
      })
    })
  })

  describe('recommended usage patterns', () => {
    it('should document that utils.ts version is for client components', () => {
      // The utils.ts version should be used in client components
      // because it has no database imports and handles undefined gracefully
      expect(utilsFormat).toBeDefined()
      expect(() => utilsFormat(75, 'speaking')).not.toThrow()
      expect(() => utilsFormat(undefined as any, 'speaking')).not.toThrow()
    })

    it('should document that queries-enhanced.ts version is for server components', () => {
      // The queries-enhanced.ts version can be used in server components
      // but should not be imported into client components due to database imports
      expect(queriesFormat).toBeDefined()
      expect(() => queriesFormat(75, 'speaking')).not.toThrow()
    })
  })
})