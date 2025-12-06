import { CacheTags, generateCacheKey } from '../cache'

describe('Cache Module', () => {
  describe('CacheTags', () => {
    it('should export all required cache tag constants', () => {
      expect(CacheTags.USER).toBe('user')
      expect(CacheTags.USER_PROFILE).toBe('user-profile')
      expect(CacheTags.USER_SUBSCRIPTION).toBe('user-subscription')
    })

    it('should have PTE-related tags', () => {
      expect(CacheTags.PTE_TESTS).toBe('pte-tests')
      expect(CacheTags.PTE_QUESTIONS).toBe('pte-questions')
      expect(CacheTags.PTE_ATTEMPTS).toBe('pte-attempts')
      expect(CacheTags.PTE_HISTORY).toBe('pte-history')
    })

    it('should have writing-related tags', () => {
      expect(CacheTags.WRITING_QUESTIONS).toBe('writing-questions')
    })

    it('should have community-related tags', () => {
      expect(CacheTags.COMMUNITY_POSTS).toBe('community-posts')
      expect(CacheTags.COMMUNITY_TRENDING).toBe('community-trending')
      expect(CacheTags.COMMUNITY_CONTRIBUTORS).toBe('community-contributors')
    })

    it('should have static content tags', () => {
      expect(CacheTags.TEMPLATES).toBe('templates')
      expect(CacheTags.VOCAB).toBe('vocab')
      expect(CacheTags.STUDY_MATERIALS).toBe('study-materials')
    })

    it('should be readonly (constant)', () => {
      // TypeScript will catch this at compile time, but we can verify values don't change
      const originalValue = CacheTags.USER
      expect(originalValue).toBe('user')
      
      // Attempting to modify should not work (TypeScript prevents this)
      // CacheTags.USER = 'modified'; // This would be a compile error
    })

    it('should have consistent naming convention', () => {
      const allTags = Object.values(CacheTags)
      
      // All tags should be lowercase with hyphens
      allTags.forEach(tag => {
        expect(tag).toMatch(/^[a-z-]+$/)
        expect(tag).not.toContain('_')
        expect(tag).not.toContain(' ')
      })
    })

    it('should not have duplicate values', () => {
      const allTags = Object.values(CacheTags)
      const uniqueTags = new Set(allTags)
      
      expect(uniqueTags.size).toBe(allTags.length)
    })
  })

  describe('generateCacheKey', () => {
    describe('basic functionality', () => {
      it('should generate key with single parameter', () => {
        const key = generateCacheKey('user', { id: '123' })
        expect(key).toBe('user_id:123')
      })

      it('should generate key with multiple parameters', () => {
        const key = generateCacheKey('questions', { 
          category: 'speaking',
          page: 1,
          limit: 20,
        })
        
        expect(key).toContain('questions_')
        expect(key).toContain('category:speaking')
        expect(key).toContain('limit:20')
        expect(key).toContain('page:1')
      })

      it('should sort parameters alphabetically', () => {
        const key1 = generateCacheKey('test', { z: 1, a: 2, m: 3 })
        const key2 = generateCacheKey('test', { a: 2, m: 3, z: 1 })
        
        // Keys should be identical regardless of parameter order
        expect(key1).toBe(key2)
        expect(key1).toMatch(/test_a:2_m:3_z:1/)
      })
    })

    describe('parameter value handling', () => {
      it('should handle string values', () => {
        const key = generateCacheKey('resource', { name: 'test-name' })
        expect(key).toBe('resource_name:test-name')
      })

      it('should handle number values', () => {
        const key = generateCacheKey('resource', { count: 42 })
        expect(key).toBe('resource_count:42')
      })

      it('should handle boolean values', () => {
        const key = generateCacheKey('resource', { active: true })
        expect(key).toBe('resource_active:true')
        
        const key2 = generateCacheKey('resource', { active: false })
        expect(key2).toBe('resource_active:false')
      })

      it('should handle null values', () => {
        const key = generateCacheKey('resource', { value: null })
        expect(key).toBe('resource_value:null')
      })

      it('should handle undefined values', () => {
        const key = generateCacheKey('resource', { value: undefined })
        expect(key).toBe('resource_value:undefined')
      })

      it('should handle array values', () => {
        const key = generateCacheKey('resource', { tags: ['tag1', 'tag2'] })
        expect(key).toContain('tags:')
        expect(key).toContain('tag1')
        expect(key).toContain('tag2')
      })

      it('should handle object values', () => {
        const key = generateCacheKey('resource', { 
          meta: { nested: 'value' },
        })
        expect(key).toContain('meta:')
      })
    })

    describe('special characters and edge cases', () => {
      it('should handle empty parameters object', () => {
        const key = generateCacheKey('resource', {})
        expect(key).toBe('resource_')
      })

      it('should handle parameters with special characters', () => {
        const key = generateCacheKey('resource', { 
          'special-key': 'value-with-dash',
        })
        expect(key).toContain('special-key:value-with-dash')
      })

      it('should handle parameters with spaces in values', () => {
        const key = generateCacheKey('resource', { 
          name: 'hello world',
        })
        expect(key).toBe('resource_name:hello world')
      })

      it('should handle very long parameter values', () => {
        const longValue = 'a'.repeat(1000)
        const key = generateCacheKey('resource', { long: longValue })
        expect(key).toContain(longValue)
        expect(key.length).toBeGreaterThan(1000)
      })

      it('should handle numeric string values', () => {
        const key = generateCacheKey('resource', { id: '123' })
        expect(key).toBe('resource_id:123')
      })
    })

    describe('consistency and determinism', () => {
      it('should generate same key for same inputs', () => {
        const params = { a: 1, b: 2, c: 3 }
        const key1 = generateCacheKey('test', params)
        const key2 = generateCacheKey('test', params)
        
        expect(key1).toBe(key2)
      })

      it('should generate different keys for different prefixes', () => {
        const params = { id: '123' }
        const key1 = generateCacheKey('user', params)
        const key2 = generateCacheKey('post', params)
        
        expect(key1).not.toBe(key2)
        expect(key1).toContain('user_')
        expect(key2).toContain('post_')
      })

      it('should generate different keys for different parameters', () => {
        const key1 = generateCacheKey('test', { id: '123' })
        const key2 = generateCacheKey('test', { id: '456' })
        
        expect(key1).not.toBe(key2)
      })

      it('should be case-sensitive', () => {
        const key1 = generateCacheKey('test', { Name: 'test' })
        const key2 = generateCacheKey('test', { name: 'test' })
        
        expect(key1).not.toBe(key2)
      })
    })

    describe('real-world usage scenarios', () => {
      it('should generate user profile cache key', () => {
        const key = generateCacheKey(CacheTags.USER_PROFILE, { 
          userId: 'user-123',
        })
        expect(key).toBe('user-profile_userId:user-123')
      })

      it('should generate paginated questions cache key', () => {
        const key = generateCacheKey(CacheTags.PTE_QUESTIONS, {
          category: 'speaking',
          page: 2,
          limit: 20,
          difficulty: 'medium',
        })
        
        expect(key).toContain('pte-questions_')
        expect(key).toContain('category:speaking')
        expect(key).toContain('difficulty:medium')
        expect(key).toContain('limit:20')
        expect(key).toContain('page:2')
      })

      it('should generate attempt history cache key', () => {
        const key = generateCacheKey(CacheTags.PTE_HISTORY, {
          userId: 'user-456',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        })
        
        expect(key).toContain('pte-history_')
        expect(key).toContain('userId:user-456')
        expect(key).toContain('startDate:2025-01-01')
        expect(key).toContain('endDate:2025-01-31')
      })

      it('should generate community posts cache key with filters', () => {
        const key = generateCacheKey(CacheTags.COMMUNITY_POSTS, {
          type: 'speaking',
          sortBy: 'recent',
          page: 1,
        })
        
        expect(key).toContain('community-posts_')
        expect(key).toContain('type:speaking')
        expect(key).toContain('sortBy:recent')
      })
    })

    describe('performance considerations', () => {
      it('should handle large number of parameters efficiently', () => {
        const manyParams: Record<string, unknown> = {}
        for (let i = 0; i < 100; i++) {
          manyParams[`param${i}`] = i
        }
        
        const startTime = Date.now()
        const key = generateCacheKey('test', manyParams)
        const endTime = Date.now()
        
        expect(key).toBeDefined()
        expect(key.length).toBeGreaterThan(0)
        // Should complete in reasonable time (< 100ms)
        expect(endTime - startTime).toBeLessThan(100)
      })

      it('should generate reasonably sized keys', () => {
        const key = generateCacheKey('test', {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          e: 5,
        })
        
        // Key should not be excessively long
        expect(key.length).toBeLessThan(200)
      })
    })
  })

  describe('Cache module integration', () => {
    it('should work together - tags and key generation', () => {
      const userId = 'user-123'
      const tag = CacheTags.USER_PROFILE
      const key = generateCacheKey(tag, { userId })
      
      expect(key).toBe('user-profile_userId:user-123')
      expect(key).toContain(tag)
    })

    it('should support complex caching strategies', () => {
      // User-specific cache
      const userKey = generateCacheKey(CacheTags.USER, { id: '123' })
      
      // Question cache with multiple filters
      const questionKey = generateCacheKey(CacheTags.PTE_QUESTIONS, {
        category: 'speaking',
        type: 'read_aloud',
        difficulty: 'hard',
        page: 1,
      })
      
      expect(userKey).not.toBe(questionKey)
      expect(userKey).toContain('user_')
      expect(questionKey).toContain('pte-questions_')
    })
  })
})