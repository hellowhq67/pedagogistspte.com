import { describe, expect, it } from '@jest/globals'
import {
  scoreListeningWriteFromDictation,
  scoreReadingFillInBlanks,
  scoreReadingMCQMultiple,
  scoreReadingMCQSingle,
  scoreReadingReorderParagraphs,
} from '@/lib/pte/scoring-deterministic'

describe('Deterministic Scoring', () => {
  describe('Reading MCQ Single', () => {
    it('should score 90 when answer is correct', () => {
      const result = scoreReadingMCQSingle({
        selectedOption: 'A',
        correctOption: 'A',
      })
      expect(result.overall).toBe(90)
      expect(result.subscores.correctness).toBe(90)
    })

    it('should score 0 when answer is incorrect', () => {
      const result = scoreReadingMCQSingle({
        selectedOption: 'B',
        correctOption: 'A',
      })
      expect(result.overall).toBe(0)
      expect(result.subscores.correctness).toBe(0)
    })

    it('should normalize case-insensitive answers', () => {
      const result = scoreReadingMCQSingle({
        selectedOption: 'apple',
        correctOption: 'Apple',
      })
      expect(result.overall).toBe(90)
    })
  })

  describe('Reading MCQ Multiple', () => {
    it('should score full credit for all correct with no false positives', () => {
      const result = scoreReadingMCQMultiple({
        selectedOptions: ['A', 'B'],
        correctOptions: ['A', 'B'],
      })
      expect(result.overall).toBe(90)
    })

    it('should apply partial credit and penalty for false positives', () => {
      const result = scoreReadingMCQMultiple({
        selectedOptions: ['A', 'B', 'C'],
        correctOptions: ['A', 'B'],
      })
      // (TP - FP) / Correct = (2 - 1) / 2 = 0.5 => 45
      expect(result.overall).toBeBeLessThanOrEqual(50)
      expect(result.overall).toBeGreaterThanOrEqual(40)
    })

    it('should score 0 when all answers are wrong', () => {
      const result = scoreReadingMCQMultiple({
        selectedOptions: ['X', 'Y'],
        correctOptions: ['A', 'B'],
      })
      expect(result.overall).toBe(0)
    })
  })

  describe('Reading Fill in Blanks', () => {
    it('should score 90 when all blanks are correct', () => {
      const result = scoreReadingFillInBlanks({
        answers: { '0': 'hello', '1': 'world' },
        correct: { '0': 'hello', '1': 'world' },
      })
      expect(result.overall).toBe(90)
      expect(result.subscores.correctness).toBe(90)
    })

    it('should apply partial credit for partial correctness', () => {
      const result = scoreReadingFillInBlanks({
        answers: { '0': 'hello', '1': 'wrong' },
        correct: { '0': 'hello', '1': 'world' },
      })
      // 1 correct out of 2 = 0.5 accuracy => 45
      expect(result.overall).toBeBeLessThanOrEqual(50)
      expect(result.overall).toBeGreaterThanOrEqual(40)
    })

    it('should normalize answers before comparison', () => {
      const result = scoreReadingFillInBlanks({
        answers: { '0': '  HELLO  ', '1': 'world!' },
        correct: { '0': 'hello', '1': 'world' },
      })
      expect(result.overall).toBe(90)
    })
  })

  describe('Reading Reorder Paragraphs', () => {
    it('should score 90 when order is completely correct', () => {
      const result = scoreReadingReorderParagraphs({
        userOrder: [1, 2, 3],
        correctOrder: [1, 2, 3],
      })
      expect(result.overall).toBe(90)
    })

    it('should use pairwise agreement for partial credit', () => {
      const result = scoreReadingReorderParagraphs({
        userOrder: [1, 3, 2],
        correctOrder: [1, 2, 3],
      })
      // 2 good pairs out of 3 total = 0.667
      expect(result.overall).toBeGreaterThan(50)
      expect(result.overall).toBeLessThan(90)
    })

    it('should score 0 when order is completely wrong', () => {
      const result = scoreReadingReorderParagraphs({
        userOrder: [3, 2, 1],
        correctOrder: [1, 2, 3],
      })
      expect(result.overall).toBe(0)
    })
  })

  describe('Listening Write from Dictation', () => {
    it('should score 90 for perfect match', () => {
      const result = scoreListeningWriteFromDictation({
        targetText: 'The quick brown fox',
        userText: 'The quick brown fox',
      })
      expect(result.overall).toBe(90)
    })

    it('should handle WER-based scoring for close matches', () => {
      const result = scoreListeningWriteFromDictation({
        targetText: 'The quick brown fox',
        userText: 'The quick brown fax',
      })
      // 1 substitution out of 4 words = WER 0.25 => acc 0.75 => ~68
      expect(result.overall).toBeGreaterThan(60)
      expect(result.overall).toBeLessThan(80)
    })

    it('should handle case-insensitive and punctuation-insensitive normalization', () => {
      const result = scoreListeningWriteFromDictation({
        targetText: 'Hello, World!',
        userText: 'hello world',
      })
      expect(result.overall).toBe(90)
    })

    it('should score low for significant differences', () => {
      const result = scoreListeningWriteFromDictation({
        targetText: 'The cat sat on the mat',
        userText: 'The dog barked',
      })
      // Large WER => low accuracy
      expect(result.overall).toBeLessThan(30)
    })

    it('should include both correctness and wer subscores when applicable', () => {
      const result = scoreListeningWriteFromDictation({
        targetText: 'hello world',
        userText: 'hello world',
      })
      expect(result.subscores.correctness).toBe(90)
      // We may also have wer subscore
      expect(result.subscores.wer).toBeDefined()
      expect(result.subscores.wer).toBe(90)
    })
  })

  describe('Metadata and rationale', () => {
    it('should include meaningful rationale in results', () => {
      const result = scoreReadingMCQSingle({
        selectedOption: 'A',
        correctOption: 'B',
      })
      expect(result.rationale).toBeDefined()
      expect(result.rationale?.length).toBeGreaterThan(0)
    })

    it('should mark deterministic in metadata', () => {
      const result = scoreReadingMCQSingle({
        selectedOption: 'A',
        correctOption: 'A',
      })
      expect(result.metadata?.provider).toBe('deterministic')
    })
  })
})
