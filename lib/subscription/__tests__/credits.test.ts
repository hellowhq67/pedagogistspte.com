import {
  getCreditsNeeded,
  getCreditStatusMessage,
  type CreditStatus,
} from '../credits'

describe('Credits Module', () => {
  describe('getCreditsNeeded', () => {
    describe('free question types (auto-scored)', () => {
      it('should return 0 for reading MCQ single', () => {
        expect(getCreditsNeeded('multiple_choice_single')).toBe(0)
      })

      it('should return 0 for reading MCQ multiple', () => {
        expect(getCreditsNeeded('multiple_choice_multiple')).toBe(0)
      })

      it('should return 0 for reorder paragraphs', () => {
        expect(getCreditsNeeded('reorder_paragraphs')).toBe(0)
      })

      it('should return 0 for reading fill in blanks', () => {
        expect(getCreditsNeeded('fill_in_blanks')).toBe(0)
      })

      it('should return 0 for reading-writing fill blanks', () => {
        expect(getCreditsNeeded('reading_writing_fill_blanks')).toBe(0)
      })

      it('should return 0 for listening MCQ single', () => {
        expect(getCreditsNeeded('multiple_choice_single')).toBe(0)
      })

      it('should return 0 for listening MCQ multiple', () => {
        expect(getCreditsNeeded('multiple_choice_multiple')).toBe(0)
      })

      it('should return 0 for highlight correct summary', () => {
        expect(getCreditsNeeded('highlight_correct_summary')).toBe(0)
      })

      it('should return 0 for select missing word', () => {
        expect(getCreditsNeeded('select_missing_word')).toBe(0)
      })
    })

    describe('AI-scored question types', () => {
      it('should return 1 for read aloud', () => {
        expect(getCreditsNeeded('read_aloud')).toBe(1)
      })

      it('should return 1 for repeat sentence', () => {
        expect(getCreditsNeeded('repeat_sentence')).toBe(1)
      })

      it('should return 1 for describe image', () => {
        expect(getCreditsNeeded('describe_image')).toBe(1)
      })

      it('should return 1 for retell lecture', () => {
        expect(getCreditsNeeded('retell_lecture')).toBe(1)
      })

      it('should return 1 for answer short question', () => {
        expect(getCreditsNeeded('answer_short_question')).toBe(1)
      })

      it('should return 1 for summarize written text', () => {
        expect(getCreditsNeeded('summarize_written_text')).toBe(1)
      })

      it('should return 1 for write essay', () => {
        expect(getCreditsNeeded('write_essay')).toBe(1)
      })

      it('should return 1 for summarize spoken text', () => {
        expect(getCreditsNeeded('summarize_spoken_text')).toBe(1)
      })

      it('should return 1 for highlight incorrect words', () => {
        expect(getCreditsNeeded('highlight_incorrect_words')).toBe(1)
      })

      it('should return 1 for write from dictation', () => {
        expect(getCreditsNeeded('write_from_dictation')).toBe(1)
      })
    })

    describe('unknown or custom question types', () => {
      it('should return 1 for unknown question types', () => {
        expect(getCreditsNeeded('unknown_type')).toBe(1)
        expect(getCreditsNeeded('custom_question')).toBe(1)
        expect(getCreditsNeeded('')).toBe(1)
      })

      it('should handle case sensitivity', () => {
        expect(getCreditsNeeded('MULTIPLE_CHOICE_SINGLE')).toBe(1)
        expect(getCreditsNeeded('Multiple_Choice_Single')).toBe(1)
      })
    })
  })

  describe('getCreditStatusMessage', () => {
    describe('unlimited credits', () => {
      it('should return unlimited message when total is -1', () => {
        const status: CreditStatus = {
          total: -1,
          used: 100,
          remaining: -1,
          resetsAt: null,
        }
        
        expect(getCreditStatusMessage(status)).toBe('Unlimited AI scoring available')
      })
    })

    describe('no credits remaining', () => {
      it('should return reset message when credits exhausted', () => {
        const resetDate = new Date('2025-01-15T00:00:00Z')
        const status: CreditStatus = {
          total: 10,
          used: 10,
          remaining: 0,
          resetsAt: resetDate,
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toContain('No AI credits remaining')
        expect(message).toContain('Resets at')
      })

      it('should handle null reset time gracefully', () => {
        const status: CreditStatus = {
          total: 10,
          used: 10,
          remaining: 0,
          resetsAt: null,
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toContain('No AI credits remaining')
        expect(message).toContain('tomorrow')
      })
    })

    describe('credits remaining', () => {
      it('should return detailed status with credits available', () => {
        const status: CreditStatus = {
          total: 10,
          used: 3,
          remaining: 7,
          resetsAt: new Date('2025-01-15T00:00:00Z'),
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toBe('7 of 10 AI credits remaining today')
      })

      it('should handle single credit remaining', () => {
        const status: CreditStatus = {
          total: 5,
          used: 4,
          remaining: 1,
          resetsAt: new Date('2025-01-15T00:00:00Z'),
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toBe('1 of 5 AI credits remaining today')
      })

      it('should handle all credits available', () => {
        const status: CreditStatus = {
          total: 20,
          used: 0,
          remaining: 20,
          resetsAt: new Date('2025-01-15T00:00:00Z'),
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toBe('20 of 20 AI credits remaining today')
      })
    })

    describe('edge cases', () => {
      it('should handle negative remaining credits gracefully', () => {
        // This shouldn't happen, but testing defensive code
        const status: CreditStatus = {
          total: 10,
          used: 12,
          remaining: -2,
          resetsAt: new Date(),
        }
        
        const message = getCreditStatusMessage(status)
        // Negative remaining should be treated as 0
        expect(message).toContain('No AI credits remaining')
      })

      it('should handle zero total credits', () => {
        const status: CreditStatus = {
          total: 0,
          used: 0,
          remaining: 0,
          resetsAt: new Date(),
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toContain('No AI credits remaining')
      })

      it('should handle large credit numbers', () => {
        const status: CreditStatus = {
          total: 1000000,
          used: 500000,
          remaining: 500000,
          resetsAt: new Date(),
        }
        
        const message = getCreditStatusMessage(status)
        expect(message).toBe('500000 of 1000000 AI credits remaining today')
      })
    })
  })

  describe('CreditStatus type', () => {
    it('should accept valid credit status objects', () => {
      const validStatus: CreditStatus = {
        total: 10,
        used: 5,
        remaining: 5,
        resetsAt: new Date(),
      }
      
      expect(validStatus.total).toBe(10)
      expect(validStatus.used).toBe(5)
      expect(validStatus.remaining).toBe(5)
      expect(validStatus.resetsAt).toBeInstanceOf(Date)
    })

    it('should allow null resetsAt for unlimited credits', () => {
      const unlimitedStatus: CreditStatus = {
        total: -1,
        used: 0,
        remaining: -1,
        resetsAt: null,
      }
      
      expect(unlimitedStatus.resetsAt).toBeNull()
    })
  })

  describe('integration scenarios', () => {
    it('should correctly identify free vs paid question workflow', () => {
      // Free question - no credits needed
      const freeQuestion = 'multiple_choice_single'
      expect(getCreditsNeeded(freeQuestion)).toBe(0)
      
      // AI question - credits needed
      const aiQuestion = 'read_aloud'
      expect(getCreditsNeeded(aiQuestion)).toBe(1)
    })

    it('should provide appropriate messages for different user tiers', () => {
      // Free tier - limited credits
      const freeTierStatus: CreditStatus = {
        total: 4,
        used: 2,
        remaining: 2,
        resetsAt: new Date(),
      }
      expect(getCreditStatusMessage(freeTierStatus)).toContain('2 of 4')
      
      // VIP tier - unlimited credits
      const vipTierStatus: CreditStatus = {
        total: -1,
        used: 100,
        remaining: -1,
        resetsAt: null,
      }
      expect(getCreditStatusMessage(vipTierStatus)).toContain('Unlimited')
    })
  })
})