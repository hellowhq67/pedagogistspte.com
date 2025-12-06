import { cn } from '../utils'

describe('Utils - cn (className merger)', () => {
  describe('basic functionality', () => {
    it('should merge single class name', () => {
      expect(cn('class1')).toBe('class1')
    })

    it('should merge multiple class names', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle empty strings', () => {
      expect(cn('', 'class1', '')).toBe('class1')
    })

    it('should handle undefined values', () => {
      expect(cn(undefined, 'class1', undefined)).toBe('class1')
    })

    it('should handle null values', () => {
      expect(cn(null as any, 'class1', null as any)).toBe('class1')
    })

    it('should handle false boolean values', () => {
      expect(cn(false && 'class1', 'class2')).toBe('class2')
    })

    it('should handle true boolean values', () => {
      expect(cn(true && 'class1', 'class2')).toContain('class1')
      expect(cn(true && 'class1', 'class2')).toContain('class2')
    })
  })

  describe('conditional classes', () => {
    it('should handle conditional classes with ternary', () => {
      const isActive = true
      const result = cn(isActive ? 'active' : 'inactive', 'base')
      expect(result).toContain('active')
      expect(result).toContain('base')
      expect(result).not.toContain('inactive')
    })

    it('should handle conditional classes with logical AND', () => {
      const hasError = true
      const result = cn('base', hasError && 'error')
      expect(result).toContain('base')
      expect(result).toContain('error')
    })

    it('should handle conditional classes with logical OR', () => {
      const variant = ''
      const result = cn('base', variant || 'default')
      expect(result).toContain('base')
      expect(result).toContain('default')
    })
  })

  describe('Tailwind CSS class merging', () => {
    it('should merge Tailwind classes without conflicts', () => {
      const result = cn('px-4 py-2', 'text-sm')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('text-sm')
    })

    it('should handle conflicting Tailwind classes (later wins)', () => {
      // tailwind-merge should resolve conflicts, keeping the last one
      const result = cn('px-4', 'px-8')
      expect(result).toBe('px-8')
    })

    it('should handle multiple conflicting classes', () => {
      const result = cn('text-sm', 'text-lg', 'text-xl')
      expect(result).toBe('text-xl')
    })

    it('should handle responsive Tailwind classes', () => {
      const result = cn('text-sm', 'md:text-lg', 'lg:text-xl')
      expect(result).toContain('text-sm')
      expect(result).toContain('md:text-lg')
      expect(result).toContain('lg:text-xl')
    })

    it('should handle hover states', () => {
      const result = cn('bg-blue-500', 'hover:bg-blue-600')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-600')
    })

    it('should handle dark mode classes', () => {
      const result = cn('bg-white', 'dark:bg-gray-900')
      expect(result).toContain('bg-white')
      expect(result).toContain('dark:bg-gray-900')
    })
  })

  describe('complex scenarios', () => {
    it('should handle array of classes', () => {
      const classes = ['class1', 'class2', 'class3']
      const result = cn(classes)
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle object notation for conditional classes', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        true && 'active',
        false && 'inactive',
        undefined,
        null,
        '',
        ['array1', 'array2']
      )
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('inactive')
      expect(result).toContain('array1')
      expect(result).toContain('array2')
    })

    it('should handle component variant patterns', () => {
      const variant = 'primary'
      const size = 'lg'
      const result = cn(
        'button-base',
        variant === 'primary' && 'bg-blue-500 text-white',
        size === 'lg' && 'px-6 py-3 text-lg'
      )
      expect(result).toContain('button-base')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
      expect(result).toContain('px-6')
      expect(result).toContain('py-3')
      expect(result).toContain('text-lg')
    })
  })

  describe('edge cases', () => {
    it('should handle no arguments', () => {
      expect(cn()).toBe('')
    })

    it('should handle only falsy values', () => {
      expect(cn(false, null, undefined, '')).toBe('')
    })

    it('should handle very long class strings', () => {
      const longClasses = Array(100).fill('class').join(' ')
      const result = cn(longClasses)
      expect(result).toBeTruthy()
    })

    it('should handle special characters in class names', () => {
      const result = cn('class-with-dash', 'class_with_underscore', 'class:with:colon')
      expect(result).toContain('class-with-dash')
      expect(result).toContain('class_with_underscore')
      expect(result).toContain('class:with:colon')
    })

    it('should handle numeric class names', () => {
      const result = cn('123', '456')
      expect(result).toContain('123')
      expect(result).toContain('456')
    })
  })

  describe('real-world component usage', () => {
    it('should work for button variants', () => {
      const getButtonClasses = (variant: 'primary' | 'secondary', disabled: boolean) => {
        return cn(
          'rounded-md font-medium transition-colors',
          variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )
      }

      const primaryButton = getButtonClasses('primary', false)
      expect(primaryButton).toContain('rounded-md')
      expect(primaryButton).toContain('bg-blue-600')
      expect(primaryButton).not.toContain('opacity-50')

      const disabledButton = getButtonClasses('secondary', true)
      expect(disabledButton).toContain('opacity-50')
      expect(disabledButton).toContain('bg-gray-200')
    })

    it('should work for card components', () => {
      const getCardClasses = (elevated: boolean, interactive: boolean) => {
        return cn(
          'rounded-lg border p-6',
          elevated && 'shadow-lg',
          interactive && 'hover:shadow-xl transition-shadow cursor-pointer'
        )
      }

      const result = getCardClasses(true, true)
      expect(result).toContain('rounded-lg')
      expect(result).toContain('shadow-lg')
      expect(result).toContain('hover:shadow-xl')
      expect(result).toContain('cursor-pointer')
    })

    it('should work for input states', () => {
      const getInputClasses = (hasError: boolean, isFocused: boolean) => {
        return cn(
          'w-full px-3 py-2 border rounded-md',
          hasError && 'border-red-500 focus:ring-red-500',
          !hasError && 'border-gray-300 focus:ring-blue-500',
          isFocused && 'ring-2'
        )
      }

      const errorInput = getInputClasses(true, false)
      expect(errorInput).toContain('border-red-500')
      expect(errorInput).not.toContain('border-gray-300')

      const focusedInput = getInputClasses(false, true)
      expect(focusedInput).toContain('ring-2')
      expect(focusedInput).toContain('border-gray-300')
    })
  })
})