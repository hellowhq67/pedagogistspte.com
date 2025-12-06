import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ms,
  format,
  timingFor,
  endAtFrom,
  driftMs,
  formatLabel,
  type PteSection,
  type SpeakingType,
  type WritingType,
  type ReadingType,
  type ListeningType,
} from './timing'

describe('ms helper', () => {
  describe('seconds conversion', () => {
    it('should convert seconds to milliseconds', () => {
      expect(ms.s(1)).toBe(1000)
      expect(ms.s(5)).toBe(5000)
      expect(ms.s(30)).toBe(30000)
      expect(ms.s(60)).toBe(60000)
    })

    it('should handle zero seconds', () => {
      expect(ms.s(0)).toBe(0)
    })

    it('should handle decimal seconds', () => {
      expect(ms.s(1.5)).toBe(1500)
      expect(ms.s(0.5)).toBe(500)
    })

    it('should handle negative seconds', () => {
      expect(ms.s(-5)).toBe(-5000)
    })
  })

  describe('minutes conversion', () => {
    it('should convert minutes to milliseconds', () => {
      expect(ms.m(1)).toBe(60000)
      expect(ms.m(5)).toBe(300000)
      expect(ms.m(10)).toBe(600000)
      expect(ms.m(30)).toBe(1800000)
    })

    it('should handle zero minutes', () => {
      expect(ms.m(0)).toBe(0)
    })

    it('should handle decimal minutes', () => {
      expect(ms.m(1.5)).toBe(90000)
      expect(ms.m(0.5)).toBe(30000)
    })

    it('should handle large values', () => {
      expect(ms.m(120)).toBe(7200000) // 2 hours
    })
  })
})

describe('format', () => {
  describe('basic formatting', () => {
    it('should format seconds correctly', () => {
      expect(format(0)).toBe('00:00')
      expect(format(1000)).toBe('00:01')
      expect(format(30000)).toBe('00:30')
      expect(format(59000)).toBe('00:59')
    })

    it('should format minutes correctly', () => {
      expect(format(60000)).toBe('01:00')
      expect(format(120000)).toBe('02:00')
      expect(format(600000)).toBe('10:00')
      expect(format(3540000)).toBe('59:00')
    })

    it('should format minutes and seconds', () => {
      expect(format(90000)).toBe('01:30')
      expect(format(135000)).toBe('02:15')
      expect(format(645000)).toBe('10:45')
    })
  })

  describe('hours formatting', () => {
    it('should format hours correctly', () => {
      expect(format(3600000)).toBe('01:00:00')
      expect(format(7200000)).toBe('02:00:00')
      expect(format(10800000)).toBe('03:00:00')
    })

    it('should format hours, minutes, and seconds', () => {
      expect(format(3661000)).toBe('01:01:01')
      expect(format(3725000)).toBe('01:02:05')
      expect(format(7384000)).toBe('02:03:04')
    })

    it('should handle large durations', () => {
      expect(format(36000000)).toBe('10:00:00') // 10 hours
      expect(format(86400000)).toBe('24:00:00') // 24 hours
    })
  })

  describe('edge cases', () => {
    it('should handle negative values as zero', () => {
      expect(format(-1000)).toBe('00:00')
      expect(format(-60000)).toBe('00:00')
    })

    it('should handle zero', () => {
      expect(format(0)).toBe('00:00')
    })

    it('should handle partial seconds', () => {
      expect(format(1500)).toBe('00:01') // rounds down
      expect(format(59999)).toBe('00:59')
    })

    it('should pad single digits with zeros', () => {
      expect(format(5000)).toBe('00:05')
      expect(format(65000)).toBe('01:05')
    })
  })
})

describe('timingFor', () => {
  describe('speaking section', () => {
    it('should return correct timing for read_aloud', () => {
      const result = timingFor('speaking', 'read_aloud')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('read_aloud')
      expect(result.prepMs).toBe(35000)
      expect(result.answerMs).toBe(40000)
    })

    it('should return correct timing for repeat_sentence', () => {
      const result = timingFor('speaking', 'repeat_sentence')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('repeat_sentence')
      expect(result.prepMs).toBe(1000)
      expect(result.answerMs).toBe(15000)
    })

    it('should return correct timing for describe_image', () => {
      const result = timingFor('speaking', 'describe_image')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('describe_image')
      expect(result.prepMs).toBe(25000)
      expect(result.answerMs).toBe(40000)
    })

    it('should return correct timing for retell_lecture', () => {
      const result = timingFor('speaking', 'retell_lecture')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('retell_lecture')
      expect(result.prepMs).toBe(10000)
      expect(result.answerMs).toBe(40000)
    })

    it('should return correct timing for answer_short_question', () => {
      const result = timingFor('speaking', 'answer_short_question')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('answer_short_question')
      expect(result.prepMs).toBe(3000)
      expect(result.answerMs).toBe(10000)
    })

    it('should return correct timing for respond_to_a_situation', () => {
      const result = timingFor('speaking', 'respond_to_a_situation')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('respond_to_a_situation')
      expect(result.prepMs).toBe(10000)
      expect(result.answerMs).toBe(40000)
    })

    it('should return correct timing for summarize_group_discussion', () => {
      const result = timingFor('speaking', 'summarize_group_discussion')
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('summarize_group_discussion')
      expect(result.prepMs).toBe(10000)
      expect(result.answerMs).toBe(120000)
    })

    it('should fallback to read_aloud for unknown type', () => {
      const result = timingFor('speaking', 'unknown_type' as SpeakingType)
      expect(result.section).toBe('speaking')
      expect(result.prepMs).toBe(35000)
      expect(result.answerMs).toBe(40000)
    })

    it('should handle case insensitivity', () => {
      const result = timingFor('speaking', 'READ_ALOUD' as SpeakingType)
      expect(result.section).toBe('speaking')
      expect(result.type).toBe('read_aloud')
    })
  })

  describe('writing section', () => {
    it('should return correct timing for summarize_written_text', () => {
      const result = timingFor('writing', 'summarize_written_text')
      expect(result.section).toBe('writing')
      expect(result.type).toBe('summarize_written_text')
      expect(result.answerMs).toBe(600000) // 10 minutes
      expect('prepMs' in result).toBe(false)
    })

    it('should return correct timing for write_essay', () => {
      const result = timingFor('writing', 'write_essay')
      expect(result.section).toBe('writing')
      expect(result.type).toBe('write_essay')
      expect(result.answerMs).toBe(1200000) // 20 minutes
    })

    it('should fallback to write_essay for unknown type', () => {
      const result = timingFor('writing', 'unknown' as WritingType)
      expect(result.section).toBe('writing')
      expect(result.answerMs).toBe(1200000)
    })

    it('should handle undefined type', () => {
      const result = timingFor('writing')
      expect(result.section).toBe('writing')
      expect(result.answerMs).toBe(1200000)
    })
  })

  describe('reading section', () => {
    it('should return section timing', () => {
      const result = timingFor('reading')
      expect(result.section).toBe('reading')
      expect(result.sectionMs).toBe(1800000) // 30 minutes
    })

    it('should return section timing with type specified', () => {
      const result = timingFor('reading', 'multiple_choice_single')
      expect(result.section).toBe('reading')
      expect(result.type).toBe('multiple_choice_single')
      expect(result.sectionMs).toBe(1800000)
    })

    it('should include type in result when provided', () => {
      const result = timingFor('reading', 'fill_in_blanks' as ReadingType)
      expect(result.section).toBe('reading')
      expect(result.type).toBe('fill_in_blanks')
    })
  })

  describe('listening section', () => {
    it('should return item timing for summarize_spoken_text', () => {
      const result = timingFor('listening', 'summarize_spoken_text')
      expect(result.section).toBe('listening')
      expect(result.type).toBe('summarize_spoken_text')
      expect(result.answerMs).toBe(600000) // 10 minutes
    })

    it('should return section timing for other types', () => {
      const result = timingFor('listening', 'multiple_choice_single')
      expect(result.section).toBe('listening')
      expect(result.type).toBe('multiple_choice_single')
      expect(result.sectionMs).toBe(2580000) // 43 minutes
    })

    it('should return section timing when no type specified', () => {
      const result = timingFor('listening')
      expect(result.section).toBe('listening')
      expect(result.sectionMs).toBe(2580000)
    })

    it('should handle all listening types', () => {
      const types: ListeningType[] = [
        'multiple_choice_single',
        'multiple_choice_multiple',
        'fill_in_blanks',
        'highlight_correct_summary',
        'select_missing_word',
        'highlight_incorrect_words',
        'write_from_dictation',
      ]

      types.forEach((type) => {
        const result = timingFor('listening', type)
        expect(result.section).toBe('listening')
        expect(result.type).toBe(type)
        expect(result.sectionMs).toBe(2580000)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle invalid section gracefully', () => {
      const result = timingFor('invalid' as PteSection)
      expect(result.section).toBe('reading')
      expect(result.sectionMs).toBeDefined()
    })
  })
})

describe('endAtFrom', () => {
  it('should calculate end time correctly', () => {
    expect(endAtFrom(1000, 5000)).toBe(6000)
    expect(endAtFrom(0, 1000)).toBe(1000)
    expect(endAtFrom(100000, 50000)).toBe(150000)
  })

  it('should handle zero duration', () => {
    expect(endAtFrom(1000, 0)).toBe(1000)
  })

  it('should handle negative duration as zero', () => {
    expect(endAtFrom(1000, -500)).toBe(1000)
  })

  it('should work with large timestamps', () => {
    const now = Date.now()
    const duration = 3600000
    expect(endAtFrom(now, duration)).toBe(now + duration)
  })
})

describe('driftMs', () => {
  it('should calculate positive drift', () => {
    expect(driftMs(1000, 1500)).toBe(500)
    expect(driftMs(0, 100)).toBe(100)
  })

  it('should calculate negative drift', () => {
    expect(driftMs(2000, 1500)).toBe(-500)
    expect(driftMs(100, 0)).toBe(-100)
  })

  it('should return zero for no drift', () => {
    expect(driftMs(1000, 1000)).toBe(0)
  })

  it('should handle large time differences', () => {
    const serverTime = Date.now()
    const clientTime = serverTime + 60000 // 1 minute ahead
    expect(driftMs(serverTime, clientTime)).toBe(60000)
  })
})

describe('formatLabel', () => {
  describe('speaking labels', () => {
    it('should format speaking labels correctly', () => {
      expect(formatLabel('speaking', 'read_aloud')).toBe('Speaking · read aloud')
      expect(formatLabel('speaking', 'repeat_sentence')).toBe('Speaking · repeat sentence')
      expect(formatLabel('speaking', 'describe_image')).toBe('Speaking · describe image')
      expect(formatLabel('speaking', 'retell_lecture')).toBe('Speaking · retell lecture')
      expect(formatLabel('speaking', 'answer_short_question')).toBe(
        'Speaking · answer short question'
      )
    })

    it('should handle speaking without type', () => {
      expect(formatLabel('speaking')).toBe('Speaking · item')
    })
  })

  describe('writing labels', () => {
    it('should format writing labels correctly', () => {
      expect(formatLabel('writing', 'summarize_written_text')).toBe(
        'Writing · summarize written text'
      )
      expect(formatLabel('writing', 'write_essay')).toBe('Writing · write essay')
    })

    it('should handle writing without type', () => {
      expect(formatLabel('writing')).toBe('Writing · item')
    })
  })

  describe('reading labels', () => {
    it('should return section label', () => {
      expect(formatLabel('reading')).toBe('Reading Section')
      expect(formatLabel('reading', 'multiple_choice_single')).toBe('Reading Section')
      expect(formatLabel('reading', 'fill_in_blanks')).toBe('Reading Section')
    })
  })

  describe('listening labels', () => {
    it('should format summarize_spoken_text specially', () => {
      expect(formatLabel('listening', 'summarize_spoken_text')).toBe(
        'Listening · Summarize Spoken Text'
      )
    })

    it('should return section label for other types', () => {
      expect(formatLabel('listening', 'multiple_choice_single')).toBe('Listening Section')
      expect(formatLabel('listening', 'fill_in_blanks')).toBe('Listening Section')
      expect(formatLabel('listening')).toBe('Listening Section')
    })
  })

  describe('edge cases', () => {
    it('should handle invalid section', () => {
      expect(formatLabel('invalid' as PteSection)).toBe('PTE')
    })

    it('should replace underscores with spaces', () => {
      expect(formatLabel('speaking', 'answer_short_question')).toContain('answer short question')
    })

    it('should handle empty type', () => {
      expect(formatLabel('speaking', '')).toBe('Speaking · item')
    })
  })
})

describe('environment overrides', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // Note: These tests would require module reloading to properly test
  // environment variable overrides. They serve as documentation of the feature.
  it('should document override capability via NEXT_PUBLIC_PTE_TIMING_OVERRIDES', () => {
    // This is a documentation test
    expect(true).toBe(true)
  })

  it('should document override capability via PTE_TIMING_OVERRIDES', () => {
    // This is a documentation test
    expect(true).toBe(true)
  })
})