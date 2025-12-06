import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (className merger)', () => {
  describe('basic functionality', () => {
    it('should merge single className', () => {
      expect(cn('class1')).toBe('class1')
    })

    it('should merge multiple classNames', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })

    it('should handle undefined and null', () => {
      expect(cn(undefined, null, 'class1')).toBe('class1')
    })
  })

  describe('conditional classes', () => {
    it('should handle boolean conditions', () => {
      expect(cn('base', true && 'conditional')).toContain('base')
      expect(cn('base', true && 'conditional')).toContain('conditional')
      expect(cn('base', false && 'conditional')).not.toContain('conditional')
    })

    it('should handle object syntax', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
      expect(result).toContain('class3')
    })
  })

  describe('Tailwind merge functionality', () => {
    it('should resolve conflicting Tailwind classes', () => {
      const result = cn('px-2', 'px-4')
      // twMerge should keep only the last padding class
      expect(result).toBe('px-4')
    })

    it('should merge non-conflicting classes', () => {
      const result = cn('px-2', 'py-4')
      expect(result).toContain('px-2')
      expect(result).toContain('py-4')
    })

    it('should handle responsive variants', () => {
      const result = cn('px-2', 'md:px-4', 'lg:px-6')
      expect(result).toContain('px-2')
      expect(result).toContain('md:px-4')
      expect(result).toContain('lg:px-6')
    })

    it('should handle hover and other state variants', () => {
      const result = cn('bg-blue-500', 'hover:bg-blue-600')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-600')
    })
  })

  describe('complex scenarios', () => {
    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        undefined,
        { 'conditional': true },
        ['array-class'],
        false && 'not-included'
      )
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).toContain('array-class')
    })

    it('should deduplicate identical classes', () => {
      const result = cn('class1', 'class1', 'class1')
      // Should only contain class1 once
      expect(result.split(' ').filter(c => c === 'class1').length).toBe(1)
    })

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).not.toMatch(/\s{2,}/) // No double spaces
    })
  })

  describe('real-world usage patterns', () => {
    it('should work with component variants', () => {
      const variant = 'primary'
      const result = cn(
        'button',
        {
          'button-primary': variant === 'primary',
          'button-secondary': variant === 'secondary',
        }
      )
      expect(result).toContain('button')
      expect(result).toContain('button-primary')
    })

    it('should work with size variants', () => {
      const size = 'lg'
      const result = cn(
        'button',
        size === 'sm' && 'text-sm px-2',
        size === 'lg' && 'text-lg px-6'
      )
      expect(result).toContain('button')
      expect(result).toContain('text-lg')
      expect(result).toContain('px-6')
    })

    it('should work with state-based classes', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'button',
        isActive && 'active',
        isDisabled && 'disabled'
      )
      expect(result).toContain('button')
      expect(result).toContain('active')
      expect(result).not.toContain('disabled')
    })

    it('should handle complex Tailwind composition', () => {
      const result = cn(
        'flex items-center justify-center',
        'px-4 py-2',
        'bg-blue-500 hover:bg-blue-600',
        'text-white font-medium',
        'rounded-lg shadow-md'
      )
      expect(result).toContain('flex')
      expect(result).toContain('items-center')
      expect(result).toContain('px-4')
      expect(result).toContain('bg-blue-500')
    })
  })
})