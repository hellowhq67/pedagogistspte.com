import { cn } from '../utils'

describe('Utils Module', () => {
  describe('cn (className merger)', () => {
    it('should merge single class name', () => {
      expect(cn('text-red-500')).toBe('text-red-500')
    })

    it('should merge multiple class names', () => {
      const result = cn('text-red-500', 'bg-blue-200')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-200')
    })

    it('should handle conflicting tailwind classes', () => {
      // twMerge should resolve conflicts, keeping the last one
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
      expect(result).not.toContain('text-red-500')
    })

    it('should handle conditional classes with clsx', () => {
      const isActive = true
      const isDisabled = false
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      )
      
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).not.toContain('disabled-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'other')
      expect(result).toContain('base')
      expect(result).toContain('other')
    })

    it('should handle empty strings', () => {
      const result = cn('base', '', 'other')
      expect(result).toContain('base')
      expect(result).toContain('other')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'always-present': true,
        'never-present': false,
        'conditionally-present': true,
      })
      
      expect(result).toContain('always-present')
      expect(result).not.toContain('never-present')
      expect(result).toContain('conditionally-present')
    })

    it('should handle complex tailwind class conflicts', () => {
      // Test padding conflict resolution
      const result1 = cn('p-4', 'p-8')
      expect(result1).toBe('p-8')
      
      // Test margin conflict resolution
      const result2 = cn('m-2', 'm-6')
      expect(result2).toBe('m-6')
      
      // Test width conflict resolution
      const result3 = cn('w-full', 'w-1/2')
      expect(result3).toBe('w-1/2')
    })

    it('should preserve non-conflicting tailwind classes', () => {
      const result = cn('text-red-500', 'bg-blue-200', 'p-4', 'rounded-lg')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-200')
      expect(result).toContain('p-4')
      expect(result).toContain('rounded-lg')
    })

    it('should handle responsive modifiers', () => {
      const result = cn('text-sm', 'md:text-base', 'lg:text-lg')
      expect(result).toContain('text-sm')
      expect(result).toContain('md:text-base')
      expect(result).toContain('lg:text-lg')
    })

    it('should handle state modifiers', () => {
      const result = cn('hover:bg-gray-100', 'focus:ring-2', 'active:scale-95')
      expect(result).toContain('hover:bg-gray-100')
      expect(result).toContain('focus:ring-2')
      expect(result).toContain('active:scale-95')
    })

    it('should handle dark mode classes', () => {
      const result = cn('bg-white', 'dark:bg-gray-900')
      expect(result).toContain('bg-white')
      expect(result).toContain('dark:bg-gray-900')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })

    it('should be performant with many classes', () => {
      const classes = Array(100).fill('class').map((c, i) => `${c}-${i}`)
      const result = cn(...classes)
      expect(result.split(' ').length).toBeGreaterThan(0)
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        { obj1: true, obj2: false },
        undefined,
        null,
        'string'
      )
      
      expect(result).toContain('base')
      expect(result).toContain('array1')
      expect(result).toContain('array2')
      expect(result).toContain('obj1')
      expect(result).not.toContain('obj2')
      expect(result).toContain('string')
    })
  })
})