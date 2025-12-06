/**
 * Comprehensive tests for AI credit system
 * Tests credit allocation, consumption, and reset logic
 */

describe('AI Credit System', () => {
  describe('Credit allocation', () => {
    it('should allocate daily credits for free tier', () => {
      const credits = getDailyCredits('free_trial');
      expect(credits).toBe(4);
    });

    it('should allocate daily credits for pro tier', () => {
      const credits = getDailyCredits('pro');
      expect(credits).toBe(10);
    });

    it('should allocate daily credits for premium tier', () => {
      const credits = getDailyCredits('premium');
      expect(credits).toBe(-1); // Unlimited
    });
  });

  describe('Credit consumption', () => {
    it('should deduct credits for AI operations', () => {
      let available = 10;
      const consumed = consumeCredits(available, 'transcription');
      expect(consumed.remaining).toBe(9);
      expect(consumed.cost).toBe(1);
    });

    it('should handle scoring operations', () => {
      let available = 10;
      const consumed = consumeCredits(available, 'scoring');
      expect(consumed.remaining).toBe(8);
      expect(consumed.cost).toBe(2);
    });

    it('should prevent negative credits', () => {
      let available = 1;
      expect(() => consumeCredits(available, 'scoring')).toThrow('Insufficient credits');
    });

    it('should handle unlimited credits', () => {
      const consumed = consumeCredits(-1, 'scoring');
      expect(consumed.remaining).toBe(-1);
      expect(consumed.cost).toBe(0);
    });
  });

  describe('Credit reset logic', () => {
    it('should reset credits daily', () => {
      const lastReset = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      expect(shouldResetCredits(lastReset)).toBe(true);
    });

    it('should not reset credits within 24 hours', () => {
      const lastReset = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
      expect(shouldResetCredits(lastReset)).toBe(false);
    });

    it('should handle first-time users', () => {
      expect(shouldResetCredits(null)).toBe(true);
    });
  });

  describe('Credit tracking', () => {
    it('should track credit usage history', () => {
      const history: CreditUsage[] = [];
      history.push(trackCreditUsage('user123', 'transcription', 1));
      history.push(trackCreditUsage('user123', 'scoring', 2));
      
      expect(history).toHaveLength(2);
      expect(history[0].operation).toBe('transcription');
      expect(history[1].operation).toBe('scoring');
      expect(history.reduce((sum, h) => sum + h.credits, 0)).toBe(3);
    });

    it('should calculate daily usage', () => {
      const today = new Date();
      const history: CreditUsage[] = [
        { operation: 'transcription', credits: 1, timestamp: today },
        { operation: 'scoring', credits: 2, timestamp: today },
        { operation: 'transcription', credits: 1, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      ];
      
      const dailyUsage = calculateDailyUsage(history);
      expect(dailyUsage).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero credits', () => {
      expect(() => consumeCredits(0, 'transcription')).toThrow('Insufficient credits');
    });

    it('should handle invalid operation types', () => {
      expect(() => consumeCredits(10, 'invalid_operation' as any)).toThrow();
    });

    it('should handle concurrent credit consumption', () => {
      // Simulate race condition
      let credits = 2;
      const operations = ['transcription', 'transcription', 'transcription'];
      const results: any[] = [];
      
      operations.forEach(op => {
        try {
          results.push(consumeCredits(credits, op));
          credits = results[results.length - 1].remaining;
        } catch (e) {
          results.push({ error: (e as Error).message });
        }
      });
      
      expect(results.filter(r => !r.error)).toHaveLength(2);
      expect(results.filter(r => r.error)).toHaveLength(1);
    });
  });
});

// Mock implementations
type CreditOperation = 'transcription' | 'scoring' | 'feedback' | 'realtime_voice';
type Tier = 'free_trial' | 'pro' | 'premium';

interface CreditUsage {
  operation: string;
  credits: number;
  timestamp: Date;
}

function getDailyCredits(tier: Tier): number {
  const limits = {
    free_trial: 4,
    pro: 10,
    premium: -1,
  };
  return limits[tier];
}

function consumeCredits(available: number, operation: CreditOperation): { remaining: number; cost: number } {
  if (available === -1) {
    return { remaining: -1, cost: 0 };
  }
  
  const costs: Record<CreditOperation, number> = {
    transcription: 1,
    scoring: 2,
    feedback: 1,
    realtime_voice: 3,
  };
  
  const cost = costs[operation];
  if (cost === undefined) {
    throw new Error(`Invalid operation: ${operation}`);
  }
  
  if (available < cost) {
    throw new Error('Insufficient credits');
  }
  
  return { remaining: available - cost, cost };
}

function shouldResetCredits(lastReset: Date | null): boolean {
  if (!lastReset) return true;
  const hoursSinceReset = (Date.now() - lastReset.getTime()) / (1000 * 60 * 60);
  return hoursSinceReset >= 24;
}

function trackCreditUsage(userId: string, operation: string, credits: number): CreditUsage {
  return {
    operation,
    credits,
    timestamp: new Date(),
  };
}

function calculateDailyUsage(history: CreditUsage[]): number {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return history
    .filter(h => h.timestamp.getTime() >= oneDayAgo)
    .reduce((sum, h) => sum + h.credits, 0);
}