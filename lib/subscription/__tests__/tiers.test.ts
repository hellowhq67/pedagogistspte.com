import {
  SubscriptionTier,
  TIER_CONFIGS,
  getTierConfig,
  canPracticeQuestionType,
  getRemainingPracticeAttempts,
  canAccessMockTest,
  canAccessSectionTest,
  hasFeatureAccess,
} from '../tiers'

describe('lib/subscription/tiers', () => {
  describe('TIER_CONFIGS constant', () => {
    it('should have configurations for all tiers', () => {
      expect(TIER_CONFIGS).toHaveProperty(SubscriptionTier.FREE)
      expect(TIER_CONFIGS).toHaveProperty(SubscriptionTier.PRO)
      expect(TIER_CONFIGS).toHaveProperty(SubscriptionTier.PREMIUM)
    })

    describe('FREE tier', () => {
      const freeConfig = TIER_CONFIGS[SubscriptionTier.FREE]

      it('should have limited mock tests', () => {
        expect(freeConfig.mockTestsAllowed).toBe(1)
        expect(freeConfig.mockTestsAvailable).toEqual([1])
      })

      it('should have practice limits for all sections', () => {
        expect(freeConfig.practiceLimits.speaking).toBeDefined()
        expect(freeConfig.practiceLimits.writing).toBeDefined()
        expect(freeConfig.practiceLimits.reading).toBeDefined()
        expect(freeConfig.practiceLimits.listening).toBeDefined()
      })

      it('should have limited daily AI credits', () => {
        expect(freeConfig.dailyAiCredits).toBe(10)
        expect(freeConfig.aiScoringPriority).toBe('normal')
      })

      it('should have limited features', () => {
        expect(freeConfig.features.testHistory).toBe(true)
        expect(freeConfig.features.detailedAnalytics).toBe(false)
        expect(freeConfig.features.studyPlan).toBe(false)
        expect(freeConfig.features.teacherReview).toBe(false)
        expect(freeConfig.features.downloadReports).toBe(false)
      })

      it('should have specific practice limits for speaking', () => {
        expect(freeConfig.practiceLimits.speaking.read_aloud).toBe(3)
        expect(freeConfig.practiceLimits.speaking.repeat_sentence).toBe(3)
        expect(freeConfig.practiceLimits.speaking.describe_image).toBe(2)
        expect(freeConfig.practiceLimits.speaking.retell_lecture).toBe(2)
        expect(freeConfig.practiceLimits.speaking.answer_short_question).toBe(3)
      })

      it('should have specific practice limits for writing', () => {
        expect(freeConfig.practiceLimits.writing.summarize_written_text).toBe(2)
        expect(freeConfig.practiceLimits.writing.write_essay).toBe(1)
      })
    })

    describe('PRO tier', () => {
      const proConfig = TIER_CONFIGS[SubscriptionTier.PRO]

      it('should have more mock tests than free', () => {
        expect(proConfig.mockTestsAllowed).toBeGreaterThan(
          TIER_CONFIGS[SubscriptionTier.FREE].mockTestsAllowed
        )
      })

      it('should have higher or unlimited practice limits', () => {
        const freeReading = TIER_CONFIGS[SubscriptionTier.FREE].practiceLimits.reading
        const proReading = proConfig.practiceLimits.reading
        
        if (freeReading.multiple_choice_single !== -1) {
          expect(
            proReading.multiple_choice_single === -1 ||
            proReading.multiple_choice_single > freeReading.multiple_choice_single
          ).toBe(true)
        }
      })

      it('should have higher daily AI credits', () => {
        expect(proConfig.dailyAiCredits).toBeGreaterThan(
          TIER_CONFIGS[SubscriptionTier.FREE].dailyAiCredits
        )
      })

      it('should have more features enabled', () => {
        const freeFeatures = TIER_CONFIGS[SubscriptionTier.FREE].features
        const proFeatures = proConfig.features
        
        // Count enabled features
        const freeEnabled = Object.values(freeFeatures).filter(
          v => v === true || (typeof v === 'number' && v === -1)
        ).length
        const proEnabled = Object.values(proFeatures).filter(
          v => v === true || (typeof v === 'number' && v === -1)
        ).length
        
        expect(proEnabled).toBeGreaterThanOrEqual(freeEnabled)
      })
    })

    describe('PREMIUM tier', () => {
      const premiumConfig = TIER_CONFIGS[SubscriptionTier.PREMIUM]

      it('should have unlimited mock tests', () => {
        expect(premiumConfig.mockTestsAllowed).toBe(-1)
      })

      it('should have unlimited or highest practice limits', () => {
        const speaking = premiumConfig.practiceLimits.speaking
        const writing = premiumConfig.practiceLimits.writing
        
        // Check if most limits are unlimited
        const unlimitedCount = Object.values({
          ...speaking,
          ...writing
        }).filter(v => v === -1).length
        
        expect(unlimitedCount).toBeGreaterThan(0)
      })

      it('should have unlimited or highest daily AI credits', () => {
        expect(
          premiumConfig.dailyAiCredits === -1 ||
          premiumConfig.dailyAiCredits >= TIER_CONFIGS[SubscriptionTier.PRO].dailyAiCredits
        ).toBe(true)
      })

      it('should have high priority AI scoring', () => {
        expect(premiumConfig.aiScoringPriority).toBe('high')
      })

      it('should have all features enabled', () => {
        expect(premiumConfig.features.testHistory).toBe(true)
        expect(premiumConfig.features.detailedAnalytics).toBe(true)
        expect(premiumConfig.features.studyPlan).toBe(true)
        expect(premiumConfig.features.downloadReports).toBe(true)
      })
    })
  })

  describe('getTierConfig', () => {
    it('should return correct config for valid tier strings', () => {
      expect(getTierConfig('free')).toEqual(TIER_CONFIGS[SubscriptionTier.FREE])
      expect(getTierConfig('pro')).toEqual(TIER_CONFIGS[SubscriptionTier.PRO])
      expect(getTierConfig('premium')).toEqual(TIER_CONFIGS[SubscriptionTier.PREMIUM])
    })

    it('should default to FREE tier for invalid tier', () => {
      expect(getTierConfig('invalid')).toEqual(TIER_CONFIGS[SubscriptionTier.FREE])
      expect(getTierConfig('')).toEqual(TIER_CONFIGS[SubscriptionTier.FREE])
      expect(getTierConfig(null as any)).toEqual(TIER_CONFIGS[SubscriptionTier.FREE])
    })

    it('should be case insensitive', () => {
      expect(getTierConfig('FREE')).toEqual(TIER_CONFIGS[SubscriptionTier.FREE])
      expect(getTierConfig('Pro')).toEqual(TIER_CONFIGS[SubscriptionTier.PRO])
      expect(getTierConfig('PREMIUM')).toEqual(TIER_CONFIGS[SubscriptionTier.PREMIUM])
    })
  })

  describe('canPracticeQuestionType', () => {
    it('should return true for unlimited access (-1)', () => {
      expect(canPracticeQuestionType('premium', 'speaking', 'read_aloud', 0)).toBe(true)
      expect(canPracticeQuestionType('premium', 'speaking', 'read_aloud', 100)).toBe(true)
    })

    it('should return true when attempts are below limit', () => {
      expect(canPracticeQuestionType('free', 'speaking', 'read_aloud', 0)).toBe(true)
      expect(canPracticeQuestionType('free', 'speaking', 'read_aloud', 2)).toBe(true)
    })

    it('should return false when attempts reach limit', () => {
      expect(canPracticeQuestionType('free', 'speaking', 'read_aloud', 3)).toBe(false)
      expect(canPracticeQuestionType('free', 'speaking', 'read_aloud', 5)).toBe(false)
    })

    it('should handle missing question types', () => {
      expect(canPracticeQuestionType('free', 'speaking', 'nonexistent_type', 0)).toBe(true)
    })

    it('should handle missing sections', () => {
      expect(canPracticeQuestionType('free', 'nonexistent_section', 'some_type', 0)).toBe(true)
    })
  })

  describe('getRemainingPracticeAttempts', () => {
    it('should return -1 for unlimited access', () => {
      expect(getRemainingPracticeAttempts('premium', 'speaking', 'read_aloud', 0)).toBe(-1)
      expect(getRemainingPracticeAttempts('premium', 'speaking', 'read_aloud', 100)).toBe(-1)
    })

    it('should calculate remaining attempts correctly', () => {
      expect(getRemainingPracticeAttempts('free', 'speaking', 'read_aloud', 0)).toBe(3)
      expect(getRemainingPracticeAttempts('free', 'speaking', 'read_aloud', 1)).toBe(2)
      expect(getRemainingPracticeAttempts('free', 'speaking', 'read_aloud', 2)).toBe(1)
    })

    it('should return 0 when limit is reached or exceeded', () => {
      expect(getRemainingPracticeAttempts('free', 'speaking', 'read_aloud', 3)).toBe(0)
      expect(getRemainingPracticeAttempts('free', 'speaking', 'read_aloud', 5)).toBe(0)
    })

    it('should handle missing question types', () => {
      expect(getRemainingPracticeAttempts('free', 'speaking', 'nonexistent', 0)).toBe(-1)
    })
  })

  describe('canAccessMockTest', () => {
    it('should allow access for premium tier (unlimited)', () => {
      expect(canAccessMockTest('premium', 1, 0)).toBe(true)
      expect(canAccessMockTest('premium', 100, 0)).toBe(true)
      expect(canAccessMockTest('premium', 1, 100)).toBe(true)
    })

    it('should check if test number is in allowed list for free tier', () => {
      expect(canAccessMockTest('free', 1, 0)).toBe(true)
      expect(canAccessMockTest('free', 2, 0)).toBe(false)
    })

    it('should check attempts taken for limited tiers', () => {
      expect(canAccessMockTest('free', 1, 0)).toBe(true)
      expect(canAccessMockTest('free', 1, 1)).toBe(false)
    })

    it('should handle invalid test numbers', () => {
      expect(canAccessMockTest('free', 0, 0)).toBe(false)
      expect(canAccessMockTest('free', -1, 0)).toBe(false)
    })
  })

  describe('canAccessSectionTest', () => {
    it('should allow unlimited section tests for premium', () => {
      const premiumFeatures = TIER_CONFIGS[SubscriptionTier.PREMIUM].features
      if (premiumFeatures.sectionTests === -1) {
        expect(canAccessSectionTest('premium', 0)).toBe(true)
        expect(canAccessSectionTest('premium', 100)).toBe(true)
      }
    })

    it('should check attempts against limit for non-unlimited tiers', () => {
      const freeFeatures = TIER_CONFIGS[SubscriptionTier.FREE].features
      const limit = freeFeatures.sectionTests
      
      if (limit !== -1) {
        expect(canAccessSectionTest('free', 0)).toBe(limit > 0)
        expect(canAccessSectionTest('free', limit - 1)).toBe(true)
        expect(canAccessSectionTest('free', limit)).toBe(false)
        expect(canAccessSectionTest('free', limit + 1)).toBe(false)
      }
    })
  })

  describe('hasFeatureAccess', () => {
    it('should correctly check boolean features', () => {
      expect(hasFeatureAccess('free', 'testHistory')).toBe(true)
      expect(hasFeatureAccess('free', 'detailedAnalytics')).toBe(false)
      expect(hasFeatureAccess('premium', 'detailedAnalytics')).toBe(true)
    })

    it('should treat -1 as unlimited/true for numeric features', () => {
      const premiumFeatures = TIER_CONFIGS[SubscriptionTier.PREMIUM].features
      if (premiumFeatures.sectionTests === -1) {
        expect(hasFeatureAccess('premium', 'sectionTests')).toBe(true)
      }
    })

    it('should return false for non-existent features', () => {
      expect(hasFeatureAccess('free', 'nonexistentFeature' as any)).toBe(false)
    })

    it('should handle all tiers', () => {
      expect(hasFeatureAccess('free', 'testHistory')).toBeDefined()
      expect(hasFeatureAccess('pro', 'testHistory')).toBeDefined()
      expect(hasFeatureAccess('premium', 'testHistory')).toBeDefined()
    })
  })

  describe('tier progression', () => {
    it('should have increasing limits from FREE to PRO to PREMIUM', () => {
      const freeMockTests = TIER_CONFIGS[SubscriptionTier.FREE].mockTestsAllowed
      const proMockTests = TIER_CONFIGS[SubscriptionTier.PRO].mockTestsAllowed
      const premiumMockTests = TIER_CONFIGS[SubscriptionTier.PREMIUM].mockTestsAllowed
      
      expect(
        freeMockTests < proMockTests || proMockTests === -1
      ).toBe(true)
      expect(premiumMockTests).toBe(-1)
    })

    it('should have increasing AI credits', () => {
      const freeCredits = TIER_CONFIGS[SubscriptionTier.FREE].dailyAiCredits
      const proCredits = TIER_CONFIGS[SubscriptionTier.PRO].dailyAiCredits
      
      expect(
        freeCredits < proCredits || proCredits === -1
      ).toBe(true)
    })
  })
})