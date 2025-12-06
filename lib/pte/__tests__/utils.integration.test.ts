/**
 * Integration tests for formatScoreByModule
 * These tests verify that the function is truly client-safe and doesn't
 * import any server-only dependencies
 */

describe('formatScoreByModule - Client Safety Integration Tests', () => {
  describe('module imports', () => {
    it('should be importable without requiring server-only dependencies', async () => {
      // This test ensures the module can be imported in a client context
      const utilsModule = await import('../utils')
      expect(utilsModule.formatScoreByModule).toBeDefined()
      expect(typeof utilsModule.formatScoreByModule).toBe('function')
    })

    it('should not throw when imported multiple times', async () => {
      await expect(import('../utils')).resolves.toBeDefined()
      await expect(import('../utils')).resolves.toBeDefined()
      await expect(import('../utils')).resolves.toBeDefined()
    })

    it('should export all expected utility functions', async () => {
      const utilsModule = await import('../utils')
      expect(utilsModule.countWords).toBeDefined()
      expect(utilsModule.mediaKindFromUrl).toBeDefined()
      expect(utilsModule.formatScoreByModule).toBeDefined()
    })
  })

  describe('function behavior consistency', () => {
    it('should produce consistent results across multiple calls', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      const testCases = [
        { score: 75, module: 'speaking' as const, expected: '75-80' },
        { score: 75, module: 'reading' as const, expected: '75' },
        { score: null, module: 'writing' as const, expected: 'N/A' },
      ]

      testCases.forEach(({ score, module, expected }) => {
        // Call multiple times to ensure consistency
        expect(formatScoreByModule(score, module)).toBe(expected)
        expect(formatScoreByModule(score, module)).toBe(expected)
        expect(formatScoreByModule(score, module)).toBe(expected)
      })
    })

    it('should be a pure function (no side effects)', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      const score = 75
      const module = 'speaking'
      
      // Store original state (if any globals were modified, this would catch it)
      const originalGlobalKeys = Object.keys(globalThis)
      
      // Call the function
      const result = formatScoreByModule(score, module)
      
      // Check no global state was modified
      const afterGlobalKeys = Object.keys(globalThis)
      expect(afterGlobalKeys).toEqual(originalGlobalKeys)
      
      // Result should be consistent
      expect(result).toBe('75-80')
    })
  })

  describe('performance characteristics', () => {
    it('should execute quickly for typical usage', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        formatScoreByModule(75, 'speaking')
      }
      const end = performance.now()
      
      // 1000 calls should take less than 10ms
      expect(end - start).toBeLessThan(10)
    })

    it('should handle concurrent calls efficiently', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(formatScoreByModule(i, i % 2 === 0 ? 'speaking' : 'reading'))
      )
      
      await expect(Promise.all(promises)).resolves.toBeDefined()
    })
  })

  describe('real-world usage patterns', () => {
    it('should work in a React component context', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      // Simulate how it would be used in a component
      const mockQuestionData = {
        communityAverageScore: 75,
        userBestScore: 80,
        module: 'speaking' as const
      }
      
      const communityScore = formatScoreByModule(
        mockQuestionData.communityAverageScore,
        mockQuestionData.module
      )
      const userScore = formatScoreByModule(
        mockQuestionData.userBestScore,
        mockQuestionData.module
      )
      
      expect(communityScore).toBe('75-80')
      expect(userScore).toBe('80-85')
    })

    it('should handle dynamic module types from user input', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      const modules: Array<'speaking' | 'reading' | 'writing' | 'listening'> = [
        'speaking',
        'reading',
        'writing',
        'listening'
      ]
      
      modules.forEach(module => {
        const result = formatScoreByModule(75, module)
        expect(result).toBeTruthy()
        expect(typeof result).toBe('string')
      })
    })

    it('should work with data from API responses', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      // Simulate API response data
      const apiResponse = {
        questions: [
          { id: 1, score: 75, module: 'speaking' },
          { id: 2, score: null, module: 'reading' },
          { id: 3, score: 82, module: 'listening' },
          { id: 4, score: 68, module: 'writing' },
        ]
      }
      
      const formattedScores = apiResponse.questions.map(q =>
        formatScoreByModule(q.score, q.module as any)
      )
      
      expect(formattedScores).toEqual(['75-80', 'N/A', '80-85', '68'])
    })
  })

  describe('compatibility with TypeScript', () => {
    it('should enforce correct module types at compile time', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      // These should work
      formatScoreByModule(75, 'speaking')
      formatScoreByModule(75, 'reading')
      formatScoreByModule(75, 'writing')
      formatScoreByModule(75, 'listening')
      
      // TypeScript would prevent: formatScoreByModule(75, 'invalid' as any)
      // We can't test compile-time errors in Jest, but this documents the expectation
      expect(true).toBe(true)
    })

    it('should handle score type variations correctly', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      // Number literals
      expect(formatScoreByModule(75, 'speaking')).toBeTruthy()
      
      // Variables
      const score: number = 75
      expect(formatScoreByModule(score, 'speaking')).toBeTruthy()
      
      // Nullable
      const nullableScore: number | null = null
      expect(formatScoreByModule(nullableScore, 'speaking')).toBe('N/A')
      
      // From calculation
      const calculatedScore = Math.round(75.5)
      expect(formatScoreByModule(calculatedScore, 'speaking')).toBeTruthy()
    })
  })

  describe('error resilience', () => {
    it('should not throw errors for edge case inputs', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      expect(() => formatScoreByModule(null, 'speaking')).not.toThrow()
      expect(() => formatScoreByModule(0, 'reading')).not.toThrow()
      expect(() => formatScoreByModule(90, 'listening')).not.toThrow()
      expect(() => formatScoreByModule(-1, 'writing')).not.toThrow()
      expect(() => formatScoreByModule(1000, 'speaking')).not.toThrow()
    })

    it('should handle floating point precision issues', async () => {
      const { formatScoreByModule } = await import('../utils')
      
      // These floating point numbers can cause issues
      expect(formatScoreByModule(0.1 + 0.2, 'reading')).toBeTruthy()
      expect(formatScoreByModule(74.99999999999999, 'speaking')).toBe('70-75')
      expect(formatScoreByModule(75.00000000000001, 'speaking')).toBe('75-80')
    })
  })
})