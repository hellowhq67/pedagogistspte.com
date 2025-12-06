import { describe, it, expect } from 'vitest'
import {
  calculateMockTestScore,
  calculateScoreFromAIFeedback,
  generateDetailedFeedbackFromAI,
  getScoreFeedback,
  getBandDescriptor,
  type PTEScore,
  type AIFeedbackData,
} from './scoring'
import { TestSection } from './types'

describe('calculateMockTestScore', () => {
  it('should return a valid mock test score structure', () => {
    const score = calculateMockTestScore([])
    
    expect(score).toHaveProperty('id')
    expect(score).toHaveProperty('testName')
    expect(score).toHaveProperty('date')
    expect(score).toHaveProperty('duration')
    expect(score).toHaveProperty('overall')
    expect(score).toHaveProperty('speaking')
    expect(score).toHaveProperty('writing')
    expect(score).toHaveProperty('reading')
    expect(score).toHaveProperty('listening')
    expect(score).toHaveProperty('enablingSkills')
    expect(score).toHaveProperty('questionScores')
    expect(score).toHaveProperty('timeSpent')
  })

  it('should generate scores in valid ranges', () => {
    const score = calculateMockTestScore([])
    
    expect(score.speaking).toBeGreaterThanOrEqual(60)
    expect(score.speaking).toBeLessThan(80)
    
    expect(score.writing).toBeGreaterThanOrEqual(60)
    expect(score.writing).toBeLessThan(80)
    
    expect(score.reading).toBeGreaterThanOrEqual(65)
    expect(score.reading).toBeLessThan(85)
    
    expect(score.listening).toBeGreaterThanOrEqual(60)
    expect(score.listening).toBeLessThan(80)
  })

  it('should calculate overall as average of sections', () => {
    const score = calculateMockTestScore([])
    const expectedOverall = Math.round(
      (score.speaking + score.writing + score.reading + score.listening) / 4
    )
    
    expect(score.overall).toBe(expectedOverall)
  })

  it('should generate valid enabling skills', () => {
    const score = calculateMockTestScore([])
    
    expect(score.enablingSkills.grammar).toBeGreaterThan(0)
    expect(score.enablingSkills.grammar).toBeLessThanOrEqual(90)
    
    expect(score.enablingSkills.oralFluency).toBeGreaterThan(0)
    expect(score.enablingSkills.oralFluency).toBeLessThanOrEqual(90)
    
    expect(score.enablingSkills.pronunciation).toBeGreaterThan(0)
    expect(score.enablingSkills.pronunciation).toBeLessThanOrEqual(90)
    
    expect(score.enablingSkills.spelling).toBeGreaterThan(0)
    expect(score.enablingSkills.spelling).toBeLessThanOrEqual(90)
    
    expect(score.enablingSkills.vocabulary).toBeGreaterThan(0)
    expect(score.enablingSkills.vocabulary).toBeLessThanOrEqual(90)
    
    expect(score.enablingSkills.writtenDiscourse).toBeGreaterThan(0)
    expect(score.enablingSkills.writtenDiscourse).toBeLessThanOrEqual(90)
  })

  it('should have correct duration', () => {
    const score = calculateMockTestScore([])
    expect(score.duration).toBe(180) // 3 hours
  })

  it('should have valid time spent records', () => {
    const score = calculateMockTestScore([])
    
    expect(score.timeSpent.speaking).toBe(1800)
    expect(score.timeSpent.writing).toBe(3000)
    expect(score.timeSpent.reading).toBe(1920)
    expect(score.timeSpent.listening).toBe(2400)
  })

  it('should generate unique IDs', () => {
    const score1 = calculateMockTestScore([])
    const score2 = calculateMockTestScore([])
    
    expect(score1.id).not.toBe(score2.id)
  })

  it('should generate valid date format', () => {
    const score = calculateMockTestScore([])
    expect(score.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should have empty questionScores array', () => {
    const score = calculateMockTestScore([])
    expect(score.questionScores).toEqual([])
    expect(Array.isArray(score.questionScores)).toBe(true)
  })
})

describe('calculateScoreFromAIFeedback', () => {
  const mockAIFeedback: AIFeedbackData = {
    overallScore: 75,
    pronunciation: { score: 80, feedback: 'Good pronunciation' },
    fluency: { score: 70, feedback: 'Decent fluency' },
    grammar: { score: 75, feedback: 'Solid grammar' },
    vocabulary: { score: 78, feedback: 'Good vocabulary' },
    content: { score: 72, feedback: 'Relevant content' },
    spelling: { score: 85, feedback: 'Excellent spelling' },
    suggestions: ['Practice more'],
    strengths: ['Clear speech'],
    areasForImprovement: ['Improve fluency'],
  }

  describe('speaking section', () => {
    it('should average pronunciation, fluency, and content scores', () => {
      const score = calculateScoreFromAIFeedback(mockAIFeedback, TestSection.SPEAKING)
      const expected = Math.round((80 + 70 + 72) / 3)
      expect(score).toBe(expected)
    })

    it('should use overall score if specific scores missing', () => {
      const feedback = { ...mockAIFeedback, pronunciation: undefined, fluency: undefined, content: undefined }
      const score = calculateScoreFromAIFeedback(feedback, TestSection.SPEAKING)
      expect(score).toBe(75)
    })

    it('should handle partial scores', () => {
      const feedback = { ...mockAIFeedback, pronunciation: undefined }
      const score = calculateScoreFromAIFeedback(feedback, TestSection.SPEAKING)
      const expected = Math.round((70 + 72) / 2)
      expect(score).toBe(expected)
    })

    it('should filter out zero scores', () => {
      const feedback = {
        ...mockAIFeedback,
        pronunciation: { score: 0, feedback: '' },
        fluency: { score: 70, feedback: 'Good' },
        content: { score: 80, feedback: 'Great' },
      }
      const score = calculateScoreFromAIFeedback(feedback, TestSection.SPEAKING)
      const expected = Math.round((70 + 80) / 2)
      expect(score).toBe(expected)
    })
  })

  describe('writing section', () => {
    it('should average content, grammar, vocabulary, and spelling scores', () => {
      const score = calculateScoreFromAIFeedback(mockAIFeedback, TestSection.WRITING)
      const expected = Math.round((72 + 75 + 78 + 85) / 4)
      expect(score).toBe(expected)
    })

    it('should use overall score if specific scores missing', () => {
      const feedback = { 
        ...mockAIFeedback, 
        content: undefined, 
        grammar: undefined, 
        vocabulary: undefined, 
        spelling: undefined 
      }
      const score = calculateScoreFromAIFeedback(feedback, TestSection.WRITING)
      expect(score).toBe(75)
    })

    it('should handle partial scores', () => {
      const feedback = { ...mockAIFeedback, grammar: undefined, vocabulary: undefined }
      const score = calculateScoreFromAIFeedback(feedback, TestSection.WRITING)
      const expected = Math.round((72 + 85) / 2)
      expect(score).toBe(expected)
    })

    it('should filter out zero scores', () => {
      const feedback = {
        ...mockAIFeedback,
        grammar: { score: 0, feedback: '' },
        vocabulary: { score: 80, feedback: 'Good' },
      }
      const score = calculateScoreFromAIFeedback(feedback, TestSection.WRITING)
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('reading and listening sections', () => {
    it('should return overall score for reading', () => {
      const score = calculateScoreFromAIFeedback(mockAIFeedback, TestSection.READING)
      expect(score).toBe(75)
    })

    it('should return overall score for listening', () => {
      const score = calculateScoreFromAIFeedback(mockAIFeedback, TestSection.LISTENING)
      expect(score).toBe(75)
    })
  })

  describe('edge cases', () => {
    it('should handle missing feedback properties', () => {
      const minimalFeedback: AIFeedbackData = {
        overallScore: 65,
        suggestions: [],
        strengths: [],
        areasForImprovement: [],
      }
      
      const score = calculateScoreFromAIFeedback(minimalFeedback, TestSection.SPEAKING)
      expect(score).toBe(65)
    })

    it('should handle all zero scores', () => {
      const zeroFeedback: AIFeedbackData = {
        overallScore: 0,
        pronunciation: { score: 0, feedback: '' },
        fluency: { score: 0, feedback: '' },
        content: { score: 0, feedback: '' },
        suggestions: [],
        strengths: [],
        areasForImprovement: [],
      }
      
      const score = calculateScoreFromAIFeedback(zeroFeedback, TestSection.SPEAKING)
      expect(score).toBe(0)
    })
  })
})

describe('generateDetailedFeedbackFromAI', () => {
  const mockAIFeedback: AIFeedbackData = {
    overallScore: 75,
    content: { score: 80, feedback: 'Content is relevant.' },
    grammar: { score: 70, feedback: 'Some grammar errors.' },
    vocabulary: { score: 78, feedback: 'Good word choice.' },
    spelling: { score: 85, feedback: 'Excellent spelling.' },
    pronunciation: { score: 72, feedback: 'Clear pronunciation.' },
    fluency: { score: 68, feedback: 'Needs more fluency.' },
    suggestions: ['Practice daily', 'Focus on grammar'],
    strengths: ['Clear communication', 'Good vocabulary'],
    areasForImprovement: ['Grammar', 'Fluency'],
  }

  it('should return correct structure', () => {
    const result = generateDetailedFeedbackFromAI(mockAIFeedback)
    
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('feedback')
    expect(result).toHaveProperty('strengths')
    expect(result).toHaveProperty('weaknesses')
  })

  it('should use overall score', () => {
    const result = generateDetailedFeedbackFromAI(mockAIFeedback)
    expect(result.score).toBe(75)
  })

  it('should combine all feedback messages', () => {
    const result = generateDetailedFeedbackFromAI(mockAIFeedback)
    
    expect(result.feedback).toContain('Content is relevant.')
    expect(result.feedback).toContain('Some grammar errors.')
    expect(result.feedback).toContain('Good word choice.')
    expect(result.feedback).toContain('Excellent spelling.')
    expect(result.feedback).toContain('Clear pronunciation.')
    expect(result.feedback).toContain('Needs more fluency.')
  })

  it('should return strengths array', () => {
    const result = generateDetailedFeedbackFromAI(mockAIFeedback)
    expect(result.strengths).toEqual(['Clear communication', 'Good vocabulary'])
  })

  it('should return areas for improvement as weaknesses', () => {
    const result = generateDetailedFeedbackFromAI(mockAIFeedback)
    expect(result.weaknesses).toEqual(['Grammar', 'Fluency'])
  })

  it('should handle missing feedback properties', () => {
    const minimalFeedback: AIFeedbackData = {
      overallScore: 65,
      suggestions: [],
      strengths: [],
      areasForImprovement: [],
    }
    
    const result = generateDetailedFeedbackFromAI(minimalFeedback)
    expect(result.feedback).toBe('AI feedback analysis completed.')
    expect(result.strengths).toEqual([])
    expect(result.weaknesses).toEqual([])
  })

  it('should filter out undefined feedback', () => {
    const partialFeedback: AIFeedbackData = {
      overallScore: 70,
      content: { score: 75, feedback: 'Good content.' },
      grammar: undefined,
      suggestions: [],
      strengths: ['Content'],
      areasForImprovement: [],
    }
    
    const result = generateDetailedFeedbackFromAI(partialFeedback)
    expect(result.feedback).toBe('Good content.')
  })
})

describe('getScoreFeedback', () => {
  describe('overall score feedback', () => {
    it('should return expert feedback for scores >= 84', () => {
      expect(getScoreFeedback('overall', 84)).toContain('Expert')
      expect(getScoreFeedback('overall', 90)).toContain('Expert')
      expect(getScoreFeedback('overall', 100)).toContain('Expert')
    })

    it('should return very good feedback for scores 75-83', () => {
      expect(getScoreFeedback('overall', 75)).toContain('Very good')
      expect(getScoreFeedback('overall', 80)).toContain('Very good')
      expect(getScoreFeedback('overall', 83)).toContain('Very good')
    })

    it('should return competent feedback for scores 65-74', () => {
      expect(getScoreFeedback('overall', 65)).toContain('Competent')
      expect(getScoreFeedback('overall', 70)).toContain('Competent')
      expect(getScoreFeedback('overall', 74)).toContain('Competent')
    })

    it('should return modest feedback for scores 50-64', () => {
      expect(getScoreFeedback('overall', 50)).toContain('Modest')
      expect(getScoreFeedback('overall', 55)).toContain('Modest')
      expect(getScoreFeedback('overall', 64)).toContain('Modest')
    })

    it('should return limited feedback for scores < 50', () => {
      expect(getScoreFeedback('overall', 49)).toContain('Limited')
      expect(getScoreFeedback('overall', 30)).toContain('Limited')
      expect(getScoreFeedback('overall', 0)).toContain('Limited')
    })
  })

  describe('other skills feedback', () => {
    it('should return excellent feedback for scores >= 84', () => {
      expect(getScoreFeedback('speaking', 84)).toContain('Excellent')
      expect(getScoreFeedback('writing', 90)).toContain('Excellent')
    })

    it('should return strong feedback for scores 75-83', () => {
      expect(getScoreFeedback('reading', 75)).toContain('Strong')
      expect(getScoreFeedback('listening', 80)).toContain('Strong')
    })

    it('should return good feedback for scores 65-74', () => {
      expect(getScoreFeedback('speaking', 65)).toContain('Good')
      expect(getScoreFeedback('writing', 70)).toContain('Good')
    })

    it('should return partial feedback for scores 50-64', () => {
      expect(getScoreFeedback('reading', 50)).toContain('Partial')
      expect(getScoreFeedback('listening', 60)).toContain('Partial')
    })

    it('should return limited feedback for scores < 50', () => {
      expect(getScoreFeedback('speaking', 49)).toContain('Limited')
      expect(getScoreFeedback('writing', 30)).toContain('Limited')
    })
  })

  describe('edge cases', () => {
    it('should handle enablingSkills parameter', () => {
      const feedback = getScoreFeedback('enablingSkills', 85)
      expect(feedback).toContain('Excellent')
    })

    it('should handle zero score', () => {
      const feedback = getScoreFeedback('overall', 0)
      expect(feedback).toContain('Limited')
    })

    it('should handle very high scores', () => {
      const feedback = getScoreFeedback('overall', 100)
      expect(feedback).toContain('Expert')
    })
  })
})

describe('getBandDescriptor', () => {
  it('should return Expert for scores >= 84', () => {
    expect(getBandDescriptor(84)).toBe('Expert (84-90)')
    expect(getBandDescriptor(90)).toBe('Expert (84-90)')
    expect(getBandDescriptor(100)).toBe('Expert (84-90)')
  })

  it('should return Very Good for scores 75-83', () => {
    expect(getBandDescriptor(75)).toBe('Very Good (75-83)')
    expect(getBandDescriptor(80)).toBe('Very Good (75-83)')
    expect(getBandDescriptor(83)).toBe('Very Good (75-83)')
  })

  it('should return Good for scores 65-74', () => {
    expect(getBandDescriptor(65)).toBe('Good (65-74)')
    expect(getBandDescriptor(70)).toBe('Good (65-74)')
    expect(getBandDescriptor(74)).toBe('Good (65-74)')
  })

  it('should return Competent for scores 50-64', () => {
    expect(getBandDescriptor(50)).toBe('Competent (50-64)')
    expect(getBandDescriptor(55)).toBe('Competent (50-64)')
    expect(getBandDescriptor(64)).toBe('Competent (50-64)')
  })

  it('should return Modest for scores 30-49', () => {
    expect(getBandDescriptor(30)).toBe('Modest (30-49)')
    expect(getBandDescriptor(40)).toBe('Modest (30-49)')
    expect(getBandDescriptor(49)).toBe('Modest (30-49)')
  })

  it('should return Limited for scores 10-29', () => {
    expect(getBandDescriptor(10)).toBe('Limited (10-29)')
    expect(getBandDescriptor(20)).toBe('Limited (10-29)')
    expect(getBandDescriptor(29)).toBe('Limited (10-29)')
  })

  it('should return Extremely Limited for scores 1-9', () => {
    expect(getBandDescriptor(1)).toBe('Extremely Limited (1-9)')
    expect(getBandDescriptor(5)).toBe('Extremely Limited (1-9)')
    expect(getBandDescriptor(9)).toBe('Extremely Limited (1-9)')
  })

  it('should return Extremely Limited for score 0', () => {
    expect(getBandDescriptor(0)).toBe('Extremely Limited (1-9)')
  })

  it('should handle boundary values correctly', () => {
    expect(getBandDescriptor(84)).toBe('Expert (84-90)')
    expect(getBandDescriptor(83)).toBe('Very Good (75-83)')
    expect(getBandDescriptor(75)).toBe('Very Good (75-83)')
    expect(getBandDescriptor(74)).toBe('Good (65-74)')
    expect(getBandDescriptor(65)).toBe('Good (65-74)')
    expect(getBandDescriptor(64)).toBe('Competent (50-64)')
    expect(getBandDescriptor(50)).toBe('Competent (50-64)')
    expect(getBandDescriptor(49)).toBe('Modest (30-49)')
    expect(getBandDescriptor(30)).toBe('Modest (30-49)')
    expect(getBandDescriptor(29)).toBe('Limited (10-29)')
    expect(getBandDescriptor(10)).toBe('Limited (10-29)')
    expect(getBandDescriptor(9)).toBe('Extremely Limited (1-9)')
  })
})