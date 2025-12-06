/**
 * Tests for Scoring Normalization Utilities
 */

import {
  clampTo90,
  accuracyTo90,
  werTo90,
  buildDeterministicResult,
  ScoringResult,
} from '@/lib/pte/scoring-normalize'
import { TestSection } from '@/lib/pte/types'

describe('clampTo90', () => {
  describe('happy path', () => {
    it('should return the value when within 0-90 range', () => {
      expect(clampTo90(45)).toBe(45)
      expect(clampTo90(0)).toBe(0)
      expect(clampTo90(90)).toBe(90)
      expect(clampTo90(50.5)).toBe(51) // rounds up
      expect(clampTo90(50.4)).toBe(50) // rounds down
    })
  })

  describe('edge cases', () => {
    it('should clamp negative values to 0', () => {
      expect(clampTo90(-1)).toBe(0)
      expect(clampTo90(-100)).toBe(0)
      expect(clampTo90(-0.1)).toBe(0)
    })

    it('should clamp values above 90 to 90', () => {
      expect(clampTo90(91)).toBe(90)
      expect(clampTo90(100)).toBe(90)
      expect(clampTo90(1000)).toBe(90)
    })

    it('should handle decimal values correctly', () => {
      expect(clampTo90(45.6)).toBe(46)
      expect(clampTo90(45.4)).toBe(45)
      expect(clampTo90(89.9)).toBe(90)
      expect(clampTo90(0.1)).toBe(0)
    })
  })

  describe('boundary conditions', () => {
    it('should handle exactly 0 and 90', () => {
      expect(clampTo90(0)).toBe(0)
      expect(clampTo90(90)).toBe(90)
    })

    it('should handle values just outside boundaries', () => {
      expect(clampTo90(-0.001)).toBe(0)
      expect(clampTo90(90.001)).toBe(90)
    })
  })

  describe('special numeric values', () => {
    it('should handle Infinity', () => {
      expect(clampTo90(Infinity)).toBe(90)
      expect(clampTo90(-Infinity)).toBe(0)
    })

    it('should handle NaN', () => {
      expect(clampTo90(NaN)).toBe(0) // Math.max/min with NaN returns NaN, Math.round(NaN) is NaN, then clamped
    })
  })
})

describe('accuracyTo90', () => {
  describe('happy path', () => {
    it('should convert 0-1 accuracy to 0-90 scale', () => {
      expect(accuracyTo90(0)).toBe(0)
      expect(accuracyTo90(0.5)).toBe(45)
      expect(accuracyTo90(1)).toBe(90)
      expect(accuracyTo90(0.75)).toBe(68) // 67.5 rounds to 68
      expect(accuracyTo90(0.25)).toBe(23) // 22.5 rounds to 23
    })
  })

  describe('edge cases', () => {
    it('should handle accuracy values outside 0-1 range', () => {
      expect(accuracyTo90(-0.5)).toBe(0)
      expect(accuracyTo90(1.5)).toBe(90)
      expect(accuracyTo90(2)).toBe(90)
    })

    it('should handle very small accuracy values', () => {
      expect(accuracyTo90(0.001)).toBe(0) // 0.09 rounds to 0
      expect(accuracyTo90(0.01)).toBe(1) // 0.9 rounds to 1
      expect(accuracyTo90(0.1)).toBe(9)
    })

    it('should handle precision near boundaries', () => {
      expect(accuracyTo90(0.9999)).toBe(90)
      expect(accuracyTo90(0.0001)).toBe(0)
    })
  })

  describe('typical PTE accuracy values', () => {
    it('should map common accuracy percentages correctly', () => {
      expect(accuracyTo90(0.8)).toBe(72) // 80% accuracy
      expect(accuracyTo90(0.9)).toBe(81) // 90% accuracy
      expect(accuracyTo90(0.6)).toBe(54) // 60% accuracy
      expect(accuracyTo90(0.7)).toBe(63) // 70% accuracy
    })
  })
})

describe('werTo90', () => {
  describe('happy path', () => {
    it('should convert perfect WER (0) to 90', () => {
      expect(werTo90(0)).toBe(90)
    })

    it('should convert WER of 1 to 0', () => {
      expect(werTo90(1)).toBe(0)
    })

    it('should convert intermediate WER values correctly', () => {
      expect(werTo90(0.5)).toBe(45) // 50% error rate -> 45 score
      expect(werTo90(0.25)).toBe(68) // 25% error rate -> 67.5 rounds to 68
      expect(werTo90(0.1)).toBe(81) // 10% error rate -> 81 score
    })
  })

  describe('edge cases', () => {
    it('should handle WER greater than 1 (very poor performance)', () => {
      expect(werTo90(1.5)).toBe(0)
      expect(werTo90(2)).toBe(0)
      expect(werTo90(10)).toBe(0)
    })

    it('should handle negative WER (invalid but defensive)', () => {
      expect(werTo90(-0.1)).toBe(90)
      expect(werTo90(-1)).toBe(90)
    })

    it('should handle very small WER values', () => {
      expect(werTo90(0.001)).toBe(90) // 89.91 rounds to 90
      expect(werTo90(0.01)).toBe(89)
      expect(werTo90(0.05)).toBe(86) // 85.5 rounds to 86
    })
  })

  describe('realistic WER scenarios', () => {
    it('should map typical dictation WER values', () => {
      expect(werTo90(0.15)).toBe(77) // 15% error -> 76.5 rounds to 77
      expect(werTo90(0.2)).toBe(72) // 20% error
      expect(werTo90(0.3)).toBe(63) // 30% error
      expect(werTo90(0.4)).toBe(54) // 40% error
    })
  })
})

describe('buildDeterministicResult', () => {
  describe('accuracy-only results', () => {
    it('should build result with only accuracy', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracy: 0.8,
        rationale: 'Test rationale',
      })

      expect(result.overall).toBe(72)
      expect(result.subscores.accuracy).toBe(72)
      expect(result.subscores.correctness).toBe(72)
      expect(result.rationale).toBe('Test rationale')
      expect(result.meta?.section).toBe(TestSection.READING)
      expect(result.meta?.provider).toBe('deterministic')
    })

    it('should handle perfect accuracy', () => {
      const result = buildDeterministicResult({
        section: TestSection.WRITING,
        accuracy: 1.0,
        rationale: 'Perfect score',
      })

      expect(result.overall).toBe(90)
      expect(result.subscores.accuracy).toBe(90)
      expect(result.subscores.correctness).toBe(90)
    })

    it('should handle zero accuracy', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0,
        rationale: 'No correct answers',
      })

      expect(result.overall).toBe(0)
      expect(result.subscores.accuracy).toBe(0)
      expect(result.subscores.correctness).toBe(0)
    })
  })

  describe('WER-only results', () => {
    it('should build result with only WER', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        wer: 0.2,
        rationale: 'WER-based scoring',
      })

      expect(result.overall).toBe(72)
      expect(result.subscores.wer).toBe(72)
      expect(result.subscores.accuracy).toBeUndefined()
      expect(result.rationale).toBe('WER-based scoring')
    })

    it('should handle perfect WER (0)', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        wer: 0,
        rationale: 'Perfect dictation',
      })

      expect(result.overall).toBe(90)
      expect(result.subscores.wer).toBe(90)
    })

    it('should handle worst WER (1 or greater)', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        wer: 1.5,
        rationale: 'Very poor dictation',
      })

      expect(result.overall).toBe(0)
      expect(result.subscores.wer).toBe(0)
    })
  })

  describe('combined accuracy and WER results', () => {
    it('should average accuracy and WER for overall score', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0.8, // -> 72
        wer: 0.2, // -> 72
        rationale: 'Combined scoring',
      })

      expect(result.overall).toBe(72)
      expect(result.subscores.accuracy).toBe(72)
      expect(result.subscores.correctness).toBe(72)
      expect(result.subscores.wer).toBe(72)
    })

    it('should average different accuracy and WER scores', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0.9, // -> 81
        wer: 0.1, // -> 81
        rationale: 'High performance',
      })

      expect(result.overall).toBe(81)
      expect(result.subscores.accuracy).toBe(81)
      expect(result.subscores.wer).toBe(81)
    })

    it('should handle disparate accuracy and WER values', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0.6, // -> 54
        wer: 0.3, // -> 63
        rationale: 'Mixed performance',
      })

      // Average of 54 and 63 = 58.5, rounds to 59
      expect(result.overall).toBe(59)
      expect(result.subscores.accuracy).toBe(54)
      expect(result.subscores.wer).toBe(63)
    })
  })

  describe('metadata handling', () => {
    it('should include section in metadata', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracy: 0.7,
        rationale: 'Test',
      })

      expect(result.meta?.section).toBe(TestSection.READING)
      expect(result.meta?.provider).toBe('deterministic')
    })

    it('should merge custom metadata', () => {
      const result = buildDeterministicResult({
        section: TestSection.WRITING,
        accuracy: 0.85,
        rationale: 'Custom meta test',
        meta: {
          task: 'READING_MCQ',
          customField: 'customValue',
          attempts: 3,
        },
      })

      expect(result.meta?.section).toBe(TestSection.WRITING)
      expect(result.meta?.provider).toBe('deterministic')
      expect(result.meta?.task).toBe('READING_MCQ')
      expect(result.meta?.customField).toBe('customValue')
      expect(result.meta?.attempts).toBe(3)
    })

    it('should handle undefined metadata', () => {
      const result = buildDeterministicResult({
        section: TestSection.SPEAKING,
        accuracy: 0.5,
        rationale: 'No custom meta',
      })

      expect(result.meta?.section).toBe(TestSection.SPEAKING)
      expect(result.meta?.provider).toBe('deterministic')
      expect(Object.keys(result.meta || {}).length).toBe(2)
    })
  })

  describe('all sections', () => {
    it('should work for READING section', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracy: 0.75,
        rationale: 'Reading test',
      })
      expect(result.meta?.section).toBe(TestSection.READING)
      expect(result.overall).toBeGreaterThan(0)
    })

    it('should work for WRITING section', () => {
      const result = buildDeterministicResult({
        section: TestSection.WRITING,
        accuracy: 0.75,
        rationale: 'Writing test',
      })
      expect(result.meta?.section).toBe(TestSection.WRITING)
      expect(result.overall).toBeGreaterThan(0)
    })

    it('should work for LISTENING section', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0.75,
        rationale: 'Listening test',
      })
      expect(result.meta?.section).toBe(TestSection.LISTENING)
      expect(result.overall).toBeGreaterThan(0)
    })

    it('should work for SPEAKING section', () => {
      const result = buildDeterministicResult({
        section: TestSection.SPEAKING,
        accuracy: 0.75,
        rationale: 'Speaking test',
      })
      expect(result.meta?.section).toBe(TestSection.SPEAKING)
      expect(result.overall).toBeGreaterThan(0)
    })
  })

  describe('edge cases for overall score calculation', () => {
    it('should handle both scores being 0', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracy: 0,
        wer: 1,
        rationale: 'Both zero',
      })
      expect(result.overall).toBe(0)
    })

    it('should handle both scores being 90', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracy: 1,
        wer: 0,
        rationale: 'Both perfect',
      })
      expect(result.overall).toBe(90)
    })

    it('should properly round averaged scores', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0.5, // -> 45
        wer: 0.5, // -> 45
        rationale: 'Exact average',
      })
      expect(result.overall).toBe(45)
    })
  })
})