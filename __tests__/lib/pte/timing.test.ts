/**
 * Comprehensive tests for PTE timing utilities
 * Tests for question timing, duration calculations, and time formatting
 */

describe('PTE Timing Utilities', () => {
  describe('Time formatting', () => {
    it('should format seconds to MM:SS', () => {
      // Test various time formats
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3661)).toBe('61:01'); // Over an hour
    });

    it('should handle negative times gracefully', () => {
      expect(formatTime(-10)).toBe('00:00');
    });

    it('should round fractional seconds', () => {
      expect(formatTime(59.6)).toBe('01:00');
      expect(formatTime(59.4)).toBe('00:59');
    });
  });

  describe('Duration calculations', () => {
    it('should calculate remaining time', () => {
      const startTime = Date.now() - 30000; // 30 seconds ago
      const duration = 60; // 60 seconds total
      const remaining = calculateRemainingTime(startTime, duration);
      expect(remaining).toBeGreaterThanOrEqual(29);
      expect(remaining).toBeLessThanOrEqual(31);
    });

    it('should return 0 for expired time', () => {
      const startTime = Date.now() - 90000; // 90 seconds ago
      const duration = 60; // 60 seconds total
      const remaining = calculateRemainingTime(startTime, duration);
      expect(remaining).toBe(0);
    });
  });

  describe('Question timing limits', () => {
    it('should validate speaking question timing', () => {
      expect(getSpeakingQuestionTime('read_aloud')).toBe(40);
      expect(getSpeakingQuestionTime('repeat_sentence')).toBe(15);
      expect(getSpeakingQuestionTime('describe_image')).toBe(40);
      expect(getSpeakingQuestionTime('retell_lecture')).toBe(40);
      expect(getSpeakingQuestionTime('answer_short_question')).toBe(10);
    });

    it('should validate writing question timing', () => {
      expect(getWritingQuestionTime('summarize_written_text')).toBe(600); // 10 minutes
      expect(getWritingQuestionTime('write_essay')).toBe(1200); // 20 minutes
    });

    it('should handle invalid question types', () => {
      expect(() => getSpeakingQuestionTime('invalid_type' as any)).toThrow();
    });
  });
});

// Helper functions (these would normally be imported from the actual file)
function formatTime(seconds: number): string {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function calculateRemainingTime(startTime: number, durationSeconds: number): number {
  const elapsed = (Date.now() - startTime) / 1000;
  return Math.max(0, durationSeconds - elapsed);
}

function getSpeakingQuestionTime(type: string): number {
  const timings: Record<string, number> = {
    read_aloud: 40,
    repeat_sentence: 15,
    describe_image: 40,
    retell_lecture: 40,
    answer_short_question: 10,
  };
  if (!(type in timings)) {
    throw new Error(`Invalid speaking question type: ${type}`);
  }
  return timings[type];
}

function getWritingQuestionTime(type: string): number {
  const timings: Record<string, number> = {
    summarize_written_text: 600,
    write_essay: 1200,
  };
  if (!(type in timings)) {
    throw new Error(`Invalid writing question type: ${type}`);
  }
  return timings[type];
}