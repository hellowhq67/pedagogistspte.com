/**
 * Comprehensive tests for PTE score breakdown system
 * Testing question type scoring contributions and helper functions
 */

import {
  pteScoreBreakdown,
  sectionSummaries,
  getQuestionTypeBySequence,
  getQuestionsBySection,
  getTotalScoreContribution,
  type QuestionTypeScoreInfo
} from '@/lib/pte/score-breakdown';

describe('PTE Score Breakdown', () => {
  describe('Score breakdown data integrity', () => {
    it('should have 22 question types', () => {
      expect(pteScoreBreakdown).toHaveLength(22);
    });

    it('should have sequential sequence numbers', () => {
      pteScoreBreakdown.forEach((q, index) => {
        expect(q.sequence).toBe(index + 1);
      });
    });

    it('should have unique abbreviations', () => {
      const abbreviations = pteScoreBreakdown.map(q => q.abbreviation);
      const uniqueAbbreviations = new Set(abbreviations);
      expect(uniqueAbbreviations.size).toBe(abbreviations.length);
    });

    it('should have all required fields', () => {
      pteScoreBreakdown.forEach(q => {
        expect(q).toHaveProperty('sequence');
        expect(q).toHaveProperty('questionType');
        expect(q).toHaveProperty('abbreviation');
        expect(q).toHaveProperty('numbers');
        expect(q).toHaveProperty('timeForAnswering');
        expect(q).toHaveProperty('section');
      });
    });
  });

  describe('Speaking & Writing section', () => {
    const speakingWritingQuestions = pteScoreBreakdown.filter(
      q => q.section === 'Speaking & Writing'
    );

    it('should have 9 question types', () => {
      expect(speakingWritingQuestions).toHaveLength(9);
    });

    it('should include Read Aloud with correct contribution', () => {
      const ra = speakingWritingQuestions.find(q => q.abbreviation === 'RA');
      expect(ra).toBeDefined();
      expect(ra?.speaking).toBe(14);
      expect(ra?.questionType).toBe('Read Aloud');
    });

    it('should include Repeat Sentence with dual contribution', () => {
      const rs = speakingWritingQuestions.find(q => q.abbreviation === 'RS');
      expect(rs).toBeDefined();
      expect(rs?.speaking).toBe(20);
      expect(rs?.listening).toBe(19);
    });

    it('should include Describe Image', () => {
      const di = speakingWritingQuestions.find(q => q.abbreviation === 'DI');
      expect(di).toBeDefined();
      expect(di?.speaking).toBe(34);
    });
  });

  describe('Reading section', () => {
    const readingQuestions = pteScoreBreakdown.filter(
      q => q.section === 'Reading'
    );

    it('should have 5 question types', () => {
      expect(readingQuestions).toHaveLength(5);
    });

    it('should only contribute to reading score', () => {
      readingQuestions.forEach(q => {
        expect(q.reading).toBeGreaterThan(0);
        expect(q.speaking).toBeUndefined();
        expect(q.writing).toBeUndefined();
        expect(q.listening).toBeUndefined();
      });
    });

    it('should include Fill in the Blanks - Drop Down with highest contribution', () => {
      const fib = readingQuestions.find(q => q.abbreviation === 'FIB_Drop Down');
      expect(fib).toBeDefined();
      expect(fib?.reading).toBe(28);
    });
  });

  describe('Listening section', () => {
    const listeningQuestions = pteScoreBreakdown.filter(
      q => q.section === 'Listening'
    );

    it('should have 8 question types', () => {
      expect(listeningQuestions).toHaveLength(8);
    });

    it('should include SST with writing contribution', () => {
      const sst = listeningQuestions.find(q => q.abbreviation === 'SST');
      expect(sst).toBeDefined();
      expect(sst?.writing).toBe(23.5);
      expect(sst?.listening).toBe(10);
    });

    it('should include WFD with dual contribution', () => {
      const wfd = listeningQuestions.find(q => q.abbreviation === 'WFD');
      expect(wfd).toBeDefined();
      expect(wfd?.writing).toBe(25.5);
      expect(wfd?.listening).toBe(14);
    });
  });

  describe('getQuestionTypeBySequence()', () => {
    it('should retrieve question by sequence number', () => {
      const q1 = getQuestionTypeBySequence(1);
      expect(q1).toBeDefined();
      expect(q1?.questionType).toBe('Read Aloud');
      expect(q1?.abbreviation).toBe('RA');
    });

    it('should retrieve last question', () => {
      const q22 = getQuestionTypeBySequence(22);
      expect(q22).toBeDefined();
      expect(q22?.questionType).toBe('Write From Dictation');
      expect(q22?.abbreviation).toBe('WFD');
    });

    it('should return undefined for invalid sequence', () => {
      expect(getQuestionTypeBySequence(0)).toBeUndefined();
      expect(getQuestionTypeBySequence(23)).toBeUndefined();
      expect(getQuestionTypeBySequence(-1)).toBeUndefined();
    });

    it('should retrieve middle questions correctly', () => {
      const q10 = getQuestionTypeBySequence(10);
      expect(q10?.abbreviation).toBe('FIB_Drop Down');
    });
  });

  describe('getQuestionsBySection()', () => {
    it('should retrieve all Speaking & Writing questions', () => {
      const questions = getQuestionsBySection('Speaking & Writing');
      expect(questions).toHaveLength(9);
      expect(questions[0].questionType).toBe('Read Aloud');
    });

    it('should retrieve all Reading questions', () => {
      const questions = getQuestionsBySection('Reading');
      expect(questions).toHaveLength(5);
      expect(questions.every(q => q.reading)).toBe(true);
    });

    it('should retrieve all Listening questions', () => {
      const questions = getQuestionsBySection('Listening');
      expect(questions).toHaveLength(8);
    });

    it('should return empty array for invalid section', () => {
      const questions = getQuestionsBySection('Invalid' as any);
      expect(questions).toHaveLength(0);
    });
  });

  describe('getTotalScoreContribution()', () => {
    it('should calculate total speaking contribution', () => {
      const total = getTotalScoreContribution('speaking');
      // RA(14) + RS(20) + DI(34) + RL(11) + ASQ(5) + SGD(13) + RTS(8) = 105
      expect(total).toBeCloseTo(105, 1);
    });

    it('should calculate total writing contribution', () => {
      const total = getTotalScoreContribution('writing');
      // SWT(25.5) + WE(25.5) + SST(23.5) + WFD(25.5) = 100
      expect(total).toBeCloseTo(100, 1);
    });

    it('should calculate total reading contribution', () => {
      const total = getTotalScoreContribution('reading');
      // Should sum to approximately 100%
      expect(total).toBeGreaterThan(90);
      expect(total).toBeLessThanOrEqual(110);
    });

    it('should calculate total listening contribution', () => {
      const total = getTotalScoreContribution('listening');
      // Should include contributions from multiple question types
      expect(total).toBeGreaterThan(80);
      expect(total).toBeLessThanOrEqual(110);
    });

    it('should return 0 for invalid skill', () => {
      const total = getTotalScoreContribution('invalid' as any);
      expect(total).toBe(0);
    });
  });

  describe('Section summaries', () => {
    it('should have summaries for all three sections', () => {
      expect(sectionSummaries).toHaveProperty('Speaking & Writing');
      expect(sectionSummaries).toHaveProperty('Reading');
      expect(sectionSummaries).toHaveProperty('Listening');
    });

    it('should have correct Speaking & Writing summary', () => {
      const summary = sectionSummaries['Speaking & Writing'];
      expect(summary.duration).toBe('76-84 mins');
      expect(summary.questionCount).toBe(9);
      expect(summary.totalQuestions).toBe('30-35');
    });

    it('should have correct Reading summary', () => {
      const summary = sectionSummaries['Reading'];
      expect(summary.duration).toBe('23-30 mins');
      expect(summary.questionCount).toBe(5);
      expect(summary.totalQuestions).toBe('15-20');
    });

    it('should have correct Listening summary', () => {
      const summary = sectionSummaries['Listening'];
      expect(summary.duration).toBe('31-39 mins');
      expect(summary.questionCount).toBe(8);
      expect(summary.totalQuestions).toBe('13-19');
    });
  });

  describe('Question timing information', () => {
    it('should have timing info for all questions', () => {
      pteScoreBreakdown.forEach(q => {
        expect(q.timeForAnswering).toBeDefined();
        expect(q.timeForAnswering.length).toBeGreaterThan(0);
      });
    });

    it('should specify preparation time for speaking questions', () => {
      const readAloud = getQuestionTypeBySequence(1);
      expect(readAloud?.timeForAnswering).toContain('Preparation');
    });

    it('should specify individual timing for timed questions', () => {
      const swt = pteScoreBreakdown.find(q => q.abbreviation === 'SWT');
      expect(swt?.timeForAnswering).toContain('timed individually');
    });
  });

  describe('Data consistency', () => {
    it('should have valid question number ranges', () => {
      pteScoreBreakdown.forEach(q => {
        expect(q.numbers).toMatch(/^\d+(-\d+)?$/);
      });
    });

    it('should have percentage contributions that are reasonable', () => {
      pteScoreBreakdown.forEach(q => {
        if (q.speaking) expect(q.speaking).toBeGreaterThan(0);
        if (q.writing) expect(q.writing).toBeGreaterThan(0);
        if (q.reading) expect(q.reading).toBeGreaterThan(0);
        if (q.listening) expect(q.listening).toBeGreaterThan(0);
      });
    });

    it('should have at least one score contribution per question', () => {
      pteScoreBreakdown.forEach(q => {
        const hasContribution = 
          q.speaking !== undefined ||
          q.writing !== undefined ||
          q.reading !== undefined ||
          q.listening !== undefined;
        expect(hasContribution).toBe(true);
      });
    });
  });
});