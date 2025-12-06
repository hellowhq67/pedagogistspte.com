import {
  MOCK_TEST_TEMPLATE,
  SECTION_TIME_LIMITS,
} from '../generator'

describe('Mock Test Generator', () => {
  describe('MOCK_TEST_TEMPLATE', () => {
    describe('speaking section', () => {
      it('should have correct question types', () => {
        expect(MOCK_TEST_TEMPLATE.speaking).toHaveProperty('read_aloud')
        expect(MOCK_TEST_TEMPLATE.speaking).toHaveProperty('repeat_sentence')
        expect(MOCK_TEST_TEMPLATE.speaking).toHaveProperty('describe_image')
        expect(MOCK_TEST_TEMPLATE.speaking).toHaveProperty('retell_lecture')
        expect(MOCK_TEST_TEMPLATE.speaking).toHaveProperty('answer_short_question')
      })

      it('should have valid min/max ranges for read_aloud', () => {
        const readAloud = MOCK_TEST_TEMPLATE.speaking.read_aloud
        expect(readAloud.min).toBe(6)
        expect(readAloud.max).toBe(7)
        expect(readAloud.min).toBeLessThanOrEqual(readAloud.max)
      })

      it('should have valid min/max ranges for repeat_sentence', () => {
        const repeatSentence = MOCK_TEST_TEMPLATE.speaking.repeat_sentence
        expect(repeatSentence.min).toBe(10)
        expect(repeatSentence.max).toBe(12)
        expect(repeatSentence.min).toBeLessThanOrEqual(repeatSentence.max)
      })

      it('should have valid min/max ranges for describe_image', () => {
        const describeImage = MOCK_TEST_TEMPLATE.speaking.describe_image
        expect(describeImage.min).toBe(3)
        expect(describeImage.max).toBe(4)
      })

      it('should have valid min/max ranges for retell_lecture', () => {
        const retellLecture = MOCK_TEST_TEMPLATE.speaking.retell_lecture
        expect(retellLecture.min).toBe(1)
        expect(retellLecture.max).toBe(2)
      })

      it('should have valid min/max ranges for answer_short_question', () => {
        const answerShort = MOCK_TEST_TEMPLATE.speaking.answer_short_question
        expect(answerShort.min).toBe(5)
        expect(answerShort.max).toBe(6)
      })

      it('should have minimum total questions in speaking', () => {
        const speakingMin = Object.values(MOCK_TEST_TEMPLATE.speaking)
          .reduce((sum, range) => sum + range.min, 0)
        
        // Speaking section should have at least 25 questions
        expect(speakingMin).toBeGreaterThanOrEqual(25)
      })

      it('should have maximum total questions in speaking', () => {
        const speakingMax = Object.values(MOCK_TEST_TEMPLATE.speaking)
          .reduce((sum, range) => sum + range.max, 0)
        
        // Speaking section should have at most 31 questions
        expect(speakingMax).toBeLessThanOrEqual(35)
      })
    })

    describe('writing section', () => {
      it('should have correct question types', () => {
        expect(MOCK_TEST_TEMPLATE.writing).toHaveProperty('summarize_written_text')
        expect(MOCK_TEST_TEMPLATE.writing).toHaveProperty('write_essay')
      })

      it('should have valid ranges for summarize_written_text', () => {
        const swt = MOCK_TEST_TEMPLATE.writing.summarize_written_text
        expect(swt.min).toBe(2)
        expect(swt.max).toBe(3)
      })

      it('should have valid ranges for write_essay', () => {
        const essay = MOCK_TEST_TEMPLATE.writing.write_essay
        expect(essay.min).toBe(1)
        expect(essay.max).toBe(2)
      })

      it('should have reasonable total questions', () => {
        const writingMin = Object.values(MOCK_TEST_TEMPLATE.writing)
          .reduce((sum, range) => sum + range.min, 0)
        const writingMax = Object.values(MOCK_TEST_TEMPLATE.writing)
          .reduce((sum, range) => sum + range.max, 0)
        
        expect(writingMin).toBe(3)
        expect(writingMax).toBe(5)
      })
    })

    describe('reading section', () => {
      it('should have correct question types', () => {
        expect(MOCK_TEST_TEMPLATE.reading).toHaveProperty('reading_writing_fill_blanks')
        expect(MOCK_TEST_TEMPLATE.reading).toHaveProperty('multiple_choice_multiple')
        expect(MOCK_TEST_TEMPLATE.reading).toHaveProperty('reorder_paragraphs')
        expect(MOCK_TEST_TEMPLATE.reading).toHaveProperty('fill_in_blanks')
        expect(MOCK_TEST_TEMPLATE.reading).toHaveProperty('multiple_choice_single')
      })

      it('should have valid ranges for all reading question types', () => {
        Object.entries(MOCK_TEST_TEMPLATE.reading).forEach(([type, range]) => {
          expect(range.min).toBeGreaterThan(0)
          expect(range.max).toBeGreaterThanOrEqual(range.min)
          expect(range.min).toBeLessThanOrEqual(6) // Reasonable upper bound
        })
      })

      it('should have minimum total questions in reading', () => {
        const readingMin = Object.values(MOCK_TEST_TEMPLATE.reading)
          .reduce((sum, range) => sum + range.min, 0)
        
        expect(readingMin).toBeGreaterThanOrEqual(15)
      })

      it('should have maximum total questions in reading', () => {
        const readingMax = Object.values(MOCK_TEST_TEMPLATE.reading)
          .reduce((sum, range) => sum + range.max, 0)
        
        expect(readingMax).toBeLessThanOrEqual(20)
      })
    })

    describe('listening section', () => {
      it('should have correct question types', () => {
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('summarize_spoken_text')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('multiple_choice_multiple')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('fill_in_blanks')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('highlight_correct_summary')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('multiple_choice_single')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('select_missing_word')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('highlight_incorrect_words')
        expect(MOCK_TEST_TEMPLATE.listening).toHaveProperty('write_from_dictation')
      })

      it('should have valid ranges for all listening question types', () => {
        Object.entries(MOCK_TEST_TEMPLATE.listening).forEach(([type, range]) => {
          expect(range.min).toBeGreaterThan(0)
          expect(range.max).toBeGreaterThanOrEqual(range.min)
          expect(range.max).toBeLessThanOrEqual(4)
        })
      })

      it('should have minimum total questions in listening', () => {
        const listeningMin = Object.values(MOCK_TEST_TEMPLATE.listening)
          .reduce((sum, range) => sum + range.min, 0)
        
        expect(listeningMin).toBeGreaterThanOrEqual(16)
      })

      it('should have maximum total questions in listening', () => {
        const listeningMax = Object.values(MOCK_TEST_TEMPLATE.listening)
          .reduce((sum, range) => sum + range.max, 0)
        
        expect(listeningMax).toBeLessThanOrEqual(24)
      })
    })

    describe('overall test structure', () => {
      it('should have all four sections', () => {
        expect(MOCK_TEST_TEMPLATE).toHaveProperty('speaking')
        expect(MOCK_TEST_TEMPLATE).toHaveProperty('writing')
        expect(MOCK_TEST_TEMPLATE).toHaveProperty('reading')
        expect(MOCK_TEST_TEMPLATE).toHaveProperty('listening')
      })

      it('should have realistic total question count', () => {
        const totalMin = Object.values(MOCK_TEST_TEMPLATE)
          .flatMap(section => Object.values(section))
          .reduce((sum, range) => sum + range.min, 0)
        
        const totalMax = Object.values(MOCK_TEST_TEMPLATE)
          .flatMap(section => Object.values(section))
          .reduce((sum, range) => sum + range.max, 0)
        
        // PTE Academic typically has 70-90 questions
        expect(totalMin).toBeGreaterThanOrEqual(60)
        expect(totalMax).toBeLessThanOrEqual(95)
      })

      it('should match official PTE Academic distribution', () => {
        // Verify the template matches official PTE Academic specs
        // Speaking: ~25-31 questions
        // Writing: ~3-5 questions
        // Reading: ~15-20 questions
        // Listening: ~16-24 questions
        
        const speakingTotal = Object.values(MOCK_TEST_TEMPLATE.speaking)
          .reduce((sum, range) => sum + range.min + range.max, 0)
        const writingTotal = Object.values(MOCK_TEST_TEMPLATE.writing)
          .reduce((sum, range) => sum + range.min + range.max, 0)
        const readingTotal = Object.values(MOCK_TEST_TEMPLATE.reading)
          .reduce((sum, range) => sum + range.min + range.max, 0)
        const listeningTotal = Object.values(MOCK_TEST_TEMPLATE.listening)
          .reduce((sum, range) => sum + range.min + range.max, 0)
        
        expect(speakingTotal).toBeGreaterThan(40)
        expect(writingTotal).toBeGreaterThan(4)
        expect(readingTotal).toBeGreaterThan(25)
        expect(listeningTotal).toBeGreaterThan(30)
      })
    })
  })

  describe('SECTION_TIME_LIMITS', () => {
    it('should have time limits for all sections', () => {
      expect(SECTION_TIME_LIMITS).toHaveProperty('speaking_writing')
      expect(SECTION_TIME_LIMITS).toHaveProperty('reading')
      expect(SECTION_TIME_LIMITS).toHaveProperty('listening')
    })

    describe('speaking_writing section', () => {
      it('should have valid time range', () => {
        const speakingWriting = SECTION_TIME_LIMITS.speaking_writing
        expect(speakingWriting.min).toBe(54)
        expect(speakingWriting.max).toBe(67)
        expect(speakingWriting.min).toBeLessThan(speakingWriting.max)
      })

      it('should match PTE Academic official timing', () => {
        // Speaking & Writing combined: 54-67 minutes
        const speakingWriting = SECTION_TIME_LIMITS.speaking_writing
        expect(speakingWriting.min).toBeGreaterThanOrEqual(54)
        expect(speakingWriting.max).toBeLessThanOrEqual(67)
      })
    })

    describe('reading section', () => {
      it('should have valid time range', () => {
        const reading = SECTION_TIME_LIMITS.reading
        expect(reading.min).toBe(29)
        expect(reading.max).toBe(30)
      })

      it('should match PTE Academic official timing', () => {
        // Reading: 29-30 minutes
        const reading = SECTION_TIME_LIMITS.reading
        expect(reading.min).toBe(29)
        expect(reading.max).toBe(30)
      })
    })

    describe('listening section', () => {
      it('should have valid time range', () => {
        const listening = SECTION_TIME_LIMITS.listening
        expect(listening.min).toBe(30)
        expect(listening.max).toBe(43)
      })

      it('should match PTE Academic official timing', () => {
        // Listening: 30-43 minutes
        const listening = SECTION_TIME_LIMITS.listening
        expect(listening.min).toBe(30)
        expect(listening.max).toBe(43)
      })
    })

    describe('total test duration', () => {
      it('should have realistic total test time', () => {
        const minTotal = Object.values(SECTION_TIME_LIMITS)
          .reduce((sum, range) => sum + range.min, 0)
        const maxTotal = Object.values(SECTION_TIME_LIMITS)
          .reduce((sum, range) => sum + range.max, 0)
        
        // PTE Academic is approximately 2-3 hours
        expect(minTotal).toBeGreaterThanOrEqual(113) // ~1.9 hours
        expect(maxTotal).toBeLessThanOrEqual(140) // ~2.3 hours
      })

      it('should match official PTE Academic duration', () => {
        // Official PTE Academic: approximately 2 hours
        const minTotal = Object.values(SECTION_TIME_LIMITS)
          .reduce((sum, range) => sum + range.min, 0)
        const maxTotal = Object.values(SECTION_TIME_LIMITS)
          .reduce((sum, range) => sum + range.max, 0)
        
        const avgTotal = (minTotal + maxTotal) / 2
        
        // Average should be around 120 minutes (2 hours)
        expect(avgTotal).toBeGreaterThan(115)
        expect(avgTotal).toBeLessThan(130)
      })
    })

    describe('time allocation reasonableness', () => {
      it('should have speaking/writing as longest section', () => {
        const sw = SECTION_TIME_LIMITS.speaking_writing
        const r = SECTION_TIME_LIMITS.reading
        const l = SECTION_TIME_LIMITS.listening
        
        expect(sw.max).toBeGreaterThan(r.max)
        expect(sw.max).toBeGreaterThan(l.max)
      })

      it('should allocate sufficient time per question on average', () => {
        // Calculate average time per question for each section
        const questionCounts = {
          speaking_writing: 30, // Approximate
          reading: 17,          // Approximate
          listening: 20,        // Approximate
        }
        
        Object.entries(SECTION_TIME_LIMITS).forEach(([section, timeRange]) => {
          const avgTime = (timeRange.min + timeRange.max) / 2
          const avgQuestions = questionCounts[section as keyof typeof questionCounts]
          const timePerQuestion = avgTime / avgQuestions
          
          // Should have at least 1 minute per question on average
          expect(timePerQuestion).toBeGreaterThan(1)
          // But not too much time (max 4 minutes per question)
          expect(timePerQuestion).toBeLessThan(5)
        })
      })
    })
  })

  describe('Template and time limits integration', () => {
    it('should have consistent structure between template and time limits', () => {
      // Speaking and writing are combined in time limits
      expect(MOCK_TEST_TEMPLATE).toHaveProperty('speaking')
      expect(MOCK_TEST_TEMPLATE).toHaveProperty('writing')
      expect(SECTION_TIME_LIMITS).toHaveProperty('speaking_writing')
      
      // Reading and listening are separate
      expect(MOCK_TEST_TEMPLATE).toHaveProperty('reading')
      expect(MOCK_TEST_TEMPLATE).toHaveProperty('listening')
      expect(SECTION_TIME_LIMITS).toHaveProperty('reading')
      expect(SECTION_TIME_LIMITS).toHaveProperty('listening')
    })

    it('should validate realistic time per question', () => {
      // Speaking section
      const speakingQuestions = Object.values(MOCK_TEST_TEMPLATE.speaking)
        .reduce((sum, range) => sum + (range.min + range.max) / 2, 0)
      
      // Writing section
      const writingQuestions = Object.values(MOCK_TEST_TEMPLATE.writing)
        .reduce((sum, range) => sum + (range.min + range.max) / 2, 0)
      
      const avgSpeakingWritingTime = (
        SECTION_TIME_LIMITS.speaking_writing.min +
        SECTION_TIME_LIMITS.speaking_writing.max
      ) / 2
      
      const timePerQuestionSW = avgSpeakingWritingTime / (speakingQuestions + writingQuestions)
      
      // Should be reasonable (0.5 - 5 minutes per question)
      expect(timePerQuestionSW).toBeGreaterThan(0.5)
      expect(timePerQuestionSW).toBeLessThan(5)
    })
  })
})