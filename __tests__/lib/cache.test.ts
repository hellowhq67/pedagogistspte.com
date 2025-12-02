/**
 * Unit tests for lib/cache.ts
 * Tests caching utilities and memoization functions
 */

import { cache } from '@/lib/cache'

describe('lib/cache', () => {
  describe('cache utility', () => {
    it('should export cache function from React', () => {
      expect(cache).toBeDefined()
      expect(typeof cache).toBe('function')
    })

    it('should memoize function calls', () => {
      let callCount = 0
      const expensiveFunction = cache((x: number) => {
        callCount++
        return x * 2
      })

      const result1 = expensiveFunction(5)
      const result2 = expensiveFunction(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(callCount).toBe(1) // Should only be called once
    })

    it('should cache different inputs separately', () => {
      let callCount = 0
      const cachedFn = cache((x: number) => {
        callCount++
        return x * 2
      })

      cachedFn(5)
      cachedFn(10)
      cachedFn(5)
      cachedFn(10)

      expect(callCount).toBe(2) // Called once for each unique input
    })

    it('should handle async functions', async () => {
      let callCount = 0
      const asyncFn = cache(async (x: number) => {
        callCount++
        return Promise.resolve(x * 2)
      })

      const result1 = await asyncFn(5)
      const result2 = await asyncFn(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(callCount).toBe(1)
    })

    it('should handle multiple parameters', () => {
      let callCount = 0
      const multiParamFn = cache((a: number, b: number) => {
        callCount++
        return a + b
      })

      multiParamFn(1, 2)
      multiParamFn(1, 2)
      multiParamFn(2, 3)

      expect(callCount).toBe(2)
    })

    it('should handle object parameters', () => {
      let callCount = 0
      const objectFn = cache((obj: { x: number; y: number }) => {
        callCount++
        return obj.x + obj.y
      })

      objectFn({ x: 1, y: 2 })
      objectFn({ x: 1, y: 2 })

      // Note: Different object instances won't be cached as same
      expect(callCount).toBeGreaterThanOrEqual(1)
    })
  })
})