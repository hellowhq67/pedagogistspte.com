/**
 * Comprehensive tests for lib/utils.ts
 * Testing utility functions including cn() className merger
 */

import { cn } from '@/lib/utils';

describe('lib/utils', () => {
  describe('cn() - className merger', () => {
    it('should merge single className', () => {
      const result = cn('text-red-500');
      expect(result).toBe('text-red-500');
    });

    it('should merge multiple classNames', () => {
      const result = cn('text-red-500', 'bg-blue-200');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-200');
    });

    it('should handle conditional classNames', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).not.toContain('hidden-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('text-red-500', undefined, null, 'bg-blue-200');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-200');
    });

    it('should handle empty strings', () => {
      const result = cn('text-red-500', '', 'bg-blue-200');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-200');
    });

    it('should handle arrays of classNames', () => {
      const result = cn(['text-red-500', 'font-bold'], 'bg-blue-200');
      expect(result).toContain('text-red-500');
      expect(result).toContain('font-bold');
      expect(result).toContain('bg-blue-200');
    });

    it('should handle object notation for conditional classes', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-200': false,
        'font-bold': true,
      });
      expect(result).toContain('text-red-500');
      expect(result).not.toContain('bg-blue-200');
      expect(result).toContain('font-bold');
    });

    it('should handle complex mixed inputs', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled',
        { 'hover:bg-gray-100': true },
        ['focus:outline-none', 'transition-colors']
      );
      expect(result).toContain('base-class');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
      expect(result).toContain('hover:bg-gray-100');
      expect(result).toContain('focus:outline-none');
      expect(result).toContain('transition-colors');
    });

    it('should handle Tailwind CSS conflict resolution', () => {
      // tailwind-merge should resolve conflicting classes
      const result = cn('p-4', 'p-8');
      // Should only contain the last padding class
      expect(result).toContain('p-8');
      expect(result).not.toContain('p-4');
    });

    it('should handle responsive classes correctly', () => {
      const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
      expect(result).toContain('text-sm');
      expect(result).toContain('md:text-base');
      expect(result).toContain('lg:text-lg');
    });
  });
});