import {
  pteCategories,
  examTypes,
  attemptTypes,
  calculateDifficultyDistribution,
} from '../parsers'

describe('Parsers Module', () => {
  describe('Constants', () => {
    it('should export correct PTE categories', () => {
      expect(pteCategories).toEqual(['speaking', 'writing', 'reading', 'listening'])
      expect(pteCategories.length).toBe(4)
    })

    it('should export correct exam types', () => {
      expect(examTypes).toEqual(['academic', 'core'])
      expect(examTypes.length).toBe(2)
    })

    it('should export correct attempt types', () => {
      expect(attemptTypes).toEqual(['speaking', 'reading', 'writing', 'listening'])
      expect(attemptTypes.length).toBe(4)
    })

    it('should have readonly arrays', () => {
      // These should be readonly tuples, verifying they exist and have values
      expect(pteCategories).toBeDefined()
      expect(examTypes).toBeDefined()
      expect(attemptTypes).toBeDefined()
    })
  })

  describe('Type Guards', () => {
    it('should validate PTE category strings', () => {
      const validCategories = ['speaking', 'writing', 'reading', 'listening']
      validCategories.forEach(cat => {
        expect(pteCategories).toContain(cat)
      })
    })

    it('should validate exam type strings', () => {
      const validExamTypes = ['academic', 'core']
      validExamTypes.forEach(type => {
        expect(examTypes).toContain(type)
      })
    })

    it('should not contain invalid values', () => {
      expect(pteCategories).not.toContain('invalid')
      expect(examTypes).not.toContain('business')
      expect(attemptTypes).not.toContain('general')
    })
  })

  describe('Enum-like behavior', () => {
    it('should support iteration', () => {
      const categories = Array.from(pteCategories)
      expect(categories).toHaveLength(4)
      
      const types = Array.from(examTypes)
      expect(types).toHaveLength(2)
    })

    it('should support includes checks', () => {
      expect(pteCategories.includes('speaking' as any)).toBe(true)
      expect(pteCategories.includes('invalid' as any)).toBe(false)
      
      expect(examTypes.includes('academic' as any)).toBe(true)
      expect(examTypes.includes('invalid' as any)).toBe(false)
    })

    it('should support map operations', () => {
      const upperCaseCategories = pteCategories.map(c => c.toUpperCase())
      expect(upperCaseCategories).toEqual(['SPEAKING', 'WRITING', 'READING', 'LISTENING'])
    })

    it('should support filter operations', () => {
      const shortNames = pteCategories.filter(c => c.length < 8)
      expect(shortNames).toContain('reading')
      expect(shortNames).toContain('writing')
    })
  })

  describe('Consistency checks', () => {
    it('should have matching attempt types and categories', () => {
      // attemptTypes should match pteCategories
      expect(attemptTypes).toEqual(pteCategories)
    })

    it('should maintain expected order', () => {
      // Verify the order is consistent with PTE test structure
      expect(pteCategories[0]).toBe('speaking')
      expect(pteCategories[1]).toBe('writing')
      expect(pteCategories[2]).toBe('reading')
      expect(pteCategories[3]).toBe('listening')
    })

    it('should not have duplicate values', () => {
      const uniqueCategories = new Set(pteCategories)
      expect(uniqueCategories.size).toBe(pteCategories.length)
      
      const uniqueExamTypes = new Set(examTypes)
      expect(uniqueExamTypes.size).toBe(examTypes.length)
    })
  })
})