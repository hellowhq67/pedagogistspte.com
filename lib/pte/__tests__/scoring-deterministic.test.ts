/**
 * Tests for deterministic scoring functions
 * These test the objective scoring logic for PTE questions
 */

import {
  scoreReadingMCQSingle,
  scoreReadingMCQMultiple,
  MCQSinglePayload,
  MCQMultiplePayload,
} from '../scoring-deterministic'

describe('lib/pte/scoring-deterministic', () => {
  describe('scoreReadingMCQSingle', () => {
    describe('correct answers', () => {
      it('should score 1 for correct answer', () => {
        const payload: MCQSinglePayload = {
          selectedOption: 'A',
          correctOption: 'A',
        }
        const result = scoreReadingMCQSingle(payload)
        
        expect(result.accuracy).toBe(1)
        expect(result.score).toBeGreaterThanOrEqual(80)
      })

      it('should handle case-insensitive matching', () => {
        const payload1: MCQSinglePayload = {
          selectedOption: 'a',
          correctOption: 'A',
        }
        const result1 = scoreReadingMCQSingle(payload1)
        expect(result1.accuracy).toBe(1)

        const payload2: MCQSinglePayload = {
          selectedOption: 'B',
          correctOption: 'b',
        }
        const result2 = scoreReadingMCQSingle(payload2)
        expect(result2.accuracy).toBe(1)
      })

      it('should handle whitespace normalization', () => {
        const payload: MCQSinglePayload = {
          selectedOption: ' A ',
          correctOption: 'A',
        }
        const result = scoreReadingMCQSingle(payload)
        expect(result.accuracy).toBe(1)
      })
    })

    describe('incorrect answers', () => {
      it('should score 0 for incorrect answer', () => {
        const payload: MCQSinglePayload = {
          selectedOption: 'A',
          correctOption: 'B',
        }
        const result = scoreReadingMCQSingle(payload)
        
        expect(result.accuracy).toBe(0)
        expect(result.score).toBeLessThanOrEqual(20)
      })

      it('should score 0 for different options', () => {
        const testCases = [
          { selected: 'A', correct: 'B' },
          { selected: 'B', correct: 'C' },
          { selected: 'C', correct: 'D' },
          { selected: 'D', correct: 'A' },
        ]

        testCases.forEach(({ selected, correct }) => {
          const result = scoreReadingMCQSingle({
            selectedOption: selected,
            correctOption: correct,
          })
          expect(result.accuracy).toBe(0)
        })
      })
    })

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        const payload: MCQSinglePayload = {
          selectedOption: '',
          correctOption: 'A',
        }
        const result = scoreReadingMCQSingle(payload)
        expect(result.accuracy).toBe(0)
      })

      it('should handle numeric options', () => {
        const payload: MCQSinglePayload = {
          selectedOption: '1',
          correctOption: '1',
        }
        const result = scoreReadingMCQSingle(payload)
        expect(result.accuracy).toBe(1)
      })

      it('should handle long option strings', () => {
        const payload: MCQSinglePayload = {
          selectedOption: 'Option A: This is a very long answer choice',
          correctOption: 'Option A: This is a very long answer choice',
        }
        const result = scoreReadingMCQSingle(payload)
        expect(result.accuracy).toBe(1)
      })
    })

    describe('result structure', () => {
      it('should return proper ScoringResult structure', () => {
        const payload: MCQSinglePayload = {
          selectedOption: 'A',
          correctOption: 'A',
        }
        const result = scoreReadingMCQSingle(payload)
        
        expect(result).toHaveProperty('accuracy')
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('section')
        expect(result.section).toBe('reading')
      })

      it('should include rationale for correct answer', () => {
        const payload: MCQSinglePayload = {
          selectedOption: 'A',
          correctOption: 'A',
        }
        const result = scoreReadingMCQSingle(payload)
        
        expect(result).toHaveProperty('rationale')
        expect(result.rationale).toContain('matches')
      })

      it('should include rationale for incorrect answer', () => {
        const payload: MCQSinglePayload = {
          selectedOption: 'A',
          correctOption: 'B',
        }
        const result = scoreReadingMCQSingle(payload)
        
        expect(result).toHaveProperty('rationale')
        expect(result.rationale).toContain('not match')
      })
    })
  })

  describe('scoreReadingMCQMultiple', () => {
    describe('fully correct answers', () => {
      it('should score 1 for all correct selections', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'B'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(1)
        expect(result.score).toBeGreaterThanOrEqual(80)
      })

      it('should handle different order of selections', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['B', 'A', 'C'],
          correctOptions: ['A', 'B', 'C'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(1)
      })

      it('should handle single correct option', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A'],
          correctOptions: ['A'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(1)
      })
    })

    describe('partial credit with penalties', () => {
      it('should apply penalty for false positives', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'B', 'C'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=2, FP=1, Correct=2
        // accuracy = max(0, (2-1)/2) = 0.5
        expect(result.accuracy).toBe(0.5)
      })

      it('should give partial credit for some correct selections', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A'],
          correctOptions: ['A', 'B', 'C'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=1, FP=0, Correct=3
        // accuracy = 1/3 ≈ 0.333
        expect(result.accuracy).toBeCloseTo(0.333, 2)
      })

      it('should score 0 when penalties exceed correct answers', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['C', 'D', 'E'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=0, FP=3, Correct=2
        // accuracy = max(0, (0-3)/2) = 0
        expect(result.accuracy).toBe(0)
      })

      it('should handle multiple wrong and some right', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'C', 'D'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=1, FP=2, Correct=2
        // accuracy = max(0, (1-2)/2) = 0
        expect(result.accuracy).toBe(0)
      })
    })

    describe('fully incorrect answers', () => {
      it('should score 0 for all wrong selections', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['C', 'D'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(0)
      })

      it('should score 0 for empty selections', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: [],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(0)
      })
    })

    describe('edge cases', () => {
      it('should handle case-insensitive matching', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['a', 'b'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(1)
      })

      it('should handle whitespace in options', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: [' A ', ' B '],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(1)
      })

      it('should handle duplicate selections (treated as one)', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'A', 'B'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // Duplicates should be deduplicated by Set
        expect(result.accuracy).toBe(1)
      })

      it('should handle large number of options', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'B', 'C', 'D', 'E'],
          correctOptions: ['A', 'B', 'C', 'D', 'E'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBe(1)
      })
    })

    describe('result structure', () => {
      it('should return proper ScoringResult structure', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'B'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result).toHaveProperty('accuracy')
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('section')
        expect(result.section).toBe('reading')
      })

      it('should include metadata', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result).toHaveProperty('meta')
      })

      it('should cap accuracy at 1.0', () => {
        // Even if logic somehow produces > 1, should be capped
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'B', 'C'],
          correctOptions: ['A', 'B', 'C'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBeLessThanOrEqual(1)
      })

      it('should never produce negative accuracy', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['D', 'E', 'F', 'G'],
          correctOptions: ['A', 'B'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        expect(result.accuracy).toBeGreaterThanOrEqual(0)
      })
    })

    describe('realistic PTE scenarios', () => {
      it('should score typical 2-out-of-5 correct scenario', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'C'],
          correctOptions: ['A', 'C', 'E'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=2, FP=0, Correct=3
        // accuracy = 2/3 ≈ 0.667
        expect(result.accuracy).toBeCloseTo(0.667, 2)
      })

      it('should penalize over-selection strategy', () => {
        // Student selects all options hoping to get points
        const payload: MCQMultiplePayload = {
          selectedOptions: ['A', 'B', 'C', 'D', 'E'],
          correctOptions: ['A', 'C'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=2, FP=3, Correct=2
        // accuracy = max(0, (2-3)/2) = 0
        expect(result.accuracy).toBe(0)
      })

      it('should reward conservative correct selections', () => {
        const payload: MCQMultiplePayload = {
          selectedOptions: ['B', 'D'],
          correctOptions: ['B', 'D', 'F'],
        }
        const result = scoreReadingMCQMultiple(payload)
        
        // TP=2, FP=0, Correct=3
        // accuracy = 2/3 ≈ 0.667
        expect(result.accuracy).toBeCloseTo(0.667, 2)
        expect(result.score).toBeGreaterThan(50)
      })
    })
  })
})