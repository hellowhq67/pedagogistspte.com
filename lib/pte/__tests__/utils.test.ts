import { countWords, mediaKindFromUrl, formatScoreByModule } from '../utils'

describe('PTE Utils', () => {
  describe('countWords', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2)
    })

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1)
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(1) // Split on empty string returns array with one empty element
    })

    it('should handle string with only whitespace', () => {
      expect(countWords('   ')).toBe(1)
    })

    it('should handle multiple spaces between words', () => {
      expect(countWords('Hello    world    test')).toBe(3)
    })

    it('should handle tabs and newlines as word separators', () => {
      expect(countWords('Hello\tworld\ntest')).toBe(3)
    })

    it('should handle mixed whitespace', () => {
      expect(countWords('  Hello   \t\n  world  \n\n  test  ')).toBe(3)
    })

    it('should handle long text with punctuation', () => {
      const text = 'This is a test. It has multiple sentences! Does it work?'
      expect(countWords(text)).toBe(12)
    })

    it('should handle hyphenated words as single words', () => {
      expect(countWords('well-known long-term')).toBe(2)
    })

    it('should handle contractions as single words', () => {
      expect(countWords("don't can't won't")).toBe(3)
    })

    it('should handle numbers as words', () => {
      expect(countWords('123 456 789')).toBe(3)
    })

    it('should handle special characters', () => {
      expect(countWords('test@example.com user#123')).toBe(2)
    })
  })

  describe('mediaKindFromUrl', () => {
    describe('audio files', () => {
      it('should detect .m4a files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.m4a')).toBe('audio')
      })

      it('should detect .mp3 files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3')).toBe('audio')
      })

      it('should detect .wav files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.wav')).toBe('audio')
      })

      it('should detect .ogg files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.ogg')).toBe('audio')
      })

      it('should be case-insensitive for audio extensions', () => {
        expect(mediaKindFromUrl('https://example.com/AUDIO.MP3')).toBe('audio')
        expect(mediaKindFromUrl('https://example.com/audio.M4A')).toBe('audio')
      })
    })

    describe('video files', () => {
      it('should detect .mp4 files', () => {
        expect(mediaKindFromUrl('https://example.com/video.mp4')).toBe('video')
      })

      it('should detect .webm files', () => {
        expect(mediaKindFromUrl('https://example.com/video.webm')).toBe('video')
      })

      it('should detect .mov files', () => {
        expect(mediaKindFromUrl('https://example.com/video.mov')).toBe('video')
      })

      it('should be case-insensitive for video extensions', () => {
        expect(mediaKindFromUrl('https://example.com/VIDEO.MP4')).toBe('video')
        expect(mediaKindFromUrl('https://example.com/video.WEBM')).toBe('video')
      })
    })

    describe('image files', () => {
      it('should detect .jpg files', () => {
        expect(mediaKindFromUrl('https://example.com/image.jpg')).toBe('image')
      })

      it('should detect .jpeg files', () => {
        expect(mediaKindFromUrl('https://example.com/image.jpeg')).toBe('image')
      })

      it('should detect .png files', () => {
        expect(mediaKindFromUrl('https://example.com/image.png')).toBe('image')
      })

      it('should detect .gif files', () => {
        expect(mediaKindFromUrl('https://example.com/image.gif')).toBe('image')
      })

      it('should detect .svg files', () => {
        expect(mediaKindFromUrl('https://example.com/image.svg')).toBe('image')
      })

      it('should detect .webp files', () => {
        expect(mediaKindFromUrl('https://example.com/image.webp')).toBe('image')
      })

      it('should be case-insensitive for image extensions', () => {
        expect(mediaKindFromUrl('https://example.com/IMAGE.JPG')).toBe('image')
        expect(mediaKindFromUrl('https://example.com/image.PNG')).toBe('image')
      })
    })

    describe('edge cases', () => {
      it('should return unknown for empty string', () => {
        expect(mediaKindFromUrl('')).toBe('unknown')
      })

      it('should return unknown for URL without extension', () => {
        expect(mediaKindFromUrl('https://example.com/file')).toBe('unknown')
      })

      it('should return unknown for unsupported extensions', () => {
        expect(mediaKindFromUrl('https://example.com/file.txt')).toBe('unknown')
        expect(mediaKindFromUrl('https://example.com/file.pdf')).toBe('unknown')
        expect(mediaKindFromUrl('https://example.com/file.doc')).toBe('unknown')
      })

      it('should handle URLs with query parameters', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3?token=abc123')).toBe('audio')
        expect(mediaKindFromUrl('https://example.com/video.mp4?autoplay=true')).toBe('video')
      })

      it('should handle URLs with fragments', () => {
        expect(mediaKindFromUrl('https://example.com/image.png#section')).toBe('image')
      })

      it('should handle complex URLs', () => {
        expect(mediaKindFromUrl('https://cdn.example.com/path/to/audio.m4a?v=1&token=xyz')).toBe('audio')
      })

      it('should handle relative URLs', () => {
        expect(mediaKindFromUrl('/assets/audio.mp3')).toBe('audio')
        expect(mediaKindFromUrl('../images/photo.jpg')).toBe('image')
      })

      it('should handle data URLs', () => {
        expect(mediaKindFromUrl('data:image/png;base64,iVBORw0KGgo=')).toBe('unknown')
      })
    })
  })

  describe('formatScoreByModule', () => {
    describe('speaking module', () => {
      it('should format score as range for speaking (0-5)', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
      })

      it('should format score as range for speaking (5-10)', () => {
        expect(formatScoreByModule(7, 'speaking')).toBe('5-10')
      })

      it('should format score as range for speaking (75-80)', () => {
        expect(formatScoreByModule(75, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(77, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(79, 'speaking')).toBe('75-80')
      })

      it('should format score as range for speaking (80-85)', () => {
        expect(formatScoreByModule(80, 'speaking')).toBe('80-85')
        expect(formatScoreByModule(82, 'speaking')).toBe('80-85')
        expect(formatScoreByModule(84, 'speaking')).toBe('80-85')
      })

      it('should format maximum score (85-90)', () => {
        expect(formatScoreByModule(85, 'speaking')).toBe('85-90')
        expect(formatScoreByModule(89, 'speaking')).toBe('85-90')
        expect(formatScoreByModule(90, 'speaking')).toBe('90-95')
      })

      it('should handle edge case at range boundaries', () => {
        expect(formatScoreByModule(5, 'speaking')).toBe('5-10')
        expect(formatScoreByModule(10, 'speaking')).toBe('10-15')
        expect(formatScoreByModule(50, 'speaking')).toBe('50-55')
      })

      it('should handle fractional scores by flooring', () => {
        expect(formatScoreByModule(72.5, 'speaking')).toBe('70-75')
        expect(formatScoreByModule(77.9, 'speaking')).toBe('75-80')
      })
    })

    describe('listening module', () => {
      it('should format score as range for listening (0-5)', () => {
        expect(formatScoreByModule(0, 'listening')).toBe('0-5')
      })

      it('should format score as range for listening (65-70)', () => {
        expect(formatScoreByModule(65, 'listening')).toBe('65-70')
        expect(formatScoreByModule(67, 'listening')).toBe('65-70')
        expect(formatScoreByModule(69, 'listening')).toBe('65-70')
      })

      it('should format score as range for listening (70-75)', () => {
        expect(formatScoreByModule(70, 'listening')).toBe('70-75')
        expect(formatScoreByModule(72, 'listening')).toBe('70-75')
      })

      it('should handle maximum score for listening', () => {
        expect(formatScoreByModule(85, 'listening')).toBe('85-90')
        expect(formatScoreByModule(90, 'listening')).toBe('90-95')
      })

      it('should handle fractional scores by flooring', () => {
        expect(formatScoreByModule(68.3, 'listening')).toBe('65-70')
        expect(formatScoreByModule(73.8, 'listening')).toBe('70-75')
      })
    })

    describe('reading module', () => {
      it('should format exact score for reading', () => {
        expect(formatScoreByModule(75, 'reading')).toBe('75')
      })

      it('should format zero score', () => {
        expect(formatScoreByModule(0, 'reading')).toBe('0')
      })

      it('should format maximum score', () => {
        expect(formatScoreByModule(90, 'reading')).toBe('90')
      })

      it('should handle fractional scores', () => {
        expect(formatScoreByModule(72.5, 'reading')).toBe('72.5')
        expect(formatScoreByModule(77.9, 'reading')).toBe('77.9')
      })

      it('should handle various score values', () => {
        expect(formatScoreByModule(45, 'reading')).toBe('45')
        expect(formatScoreByModule(67, 'reading')).toBe('67')
        expect(formatScoreByModule(83, 'reading')).toBe('83')
      })
    })

    describe('writing module', () => {
      it('should format exact score for writing', () => {
        expect(formatScoreByModule(75, 'writing')).toBe('75')
      })

      it('should format zero score', () => {
        expect(formatScoreByModule(0, 'writing')).toBe('0')
      })

      it('should format maximum score', () => {
        expect(formatScoreByModule(90, 'writing')).toBe('90')
      })

      it('should handle fractional scores', () => {
        expect(formatScoreByModule(72.5, 'writing')).toBe('72.5')
        expect(formatScoreByModule(77.9, 'writing')).toBe('77.9')
      })

      it('should handle various score values', () => {
        expect(formatScoreByModule(45, 'writing')).toBe('45')
        expect(formatScoreByModule(67, 'writing')).toBe('67')
        expect(formatScoreByModule(83, 'writing')).toBe('83')
      })
    })

    describe('null and undefined handling', () => {
      it('should return N/A for null score', () => {
        expect(formatScoreByModule(null, 'speaking')).toBe('N/A')
        expect(formatScoreByModule(null, 'listening')).toBe('N/A')
        expect(formatScoreByModule(null, 'reading')).toBe('N/A')
        expect(formatScoreByModule(null, 'writing')).toBe('N/A')
      })

      it('should return N/A for undefined score', () => {
        expect(formatScoreByModule(undefined as any, 'speaking')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'listening')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'reading')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'writing')).toBe('N/A')
      })
    })

    describe('boundary values', () => {
      it('should handle negative scores gracefully', () => {
        // Negative scores should still follow the formatting logic
        expect(formatScoreByModule(-5, 'speaking')).toBe('-5--0')
        expect(formatScoreByModule(-1, 'reading')).toBe('-1')
      })

      it('should handle very large scores', () => {
        expect(formatScoreByModule(100, 'speaking')).toBe('100-105')
        expect(formatScoreByModule(100, 'reading')).toBe('100')
      })

      it('should handle decimal precision', () => {
        expect(formatScoreByModule(75.123456, 'reading')).toBe('75.123456')
        expect(formatScoreByModule(75.999, 'speaking')).toBe('75-80')
      })
    })

    describe('consistency across modules', () => {
      it('should consistently format speaking and listening as ranges', () => {
        const score = 75
        expect(formatScoreByModule(score, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(score, 'listening')).toBe('75-80')
      })

      it('should consistently format reading and writing as exact scores', () => {
        const score = 75
        expect(formatScoreByModule(score, 'reading')).toBe('75')
        expect(formatScoreByModule(score, 'writing')).toBe('75')
      })

      it('should handle all modules consistently for null values', () => {
        const modules: Array<'speaking' | 'listening' | 'reading' | 'writing'> = [
          'speaking',
          'listening',
          'reading',
          'writing',
        ]
        modules.forEach((module) => {
          expect(formatScoreByModule(null, module)).toBe('N/A')
        })
      })
    })

    describe('real-world PTE score scenarios', () => {
      it('should format typical passing scores', () => {
        // Typical passing scores for various purposes
        expect(formatScoreByModule(50, 'speaking')).toBe('50-55')
        expect(formatScoreByModule(65, 'listening')).toBe('65-70')
        expect(formatScoreByModule(58, 'reading')).toBe('58')
        expect(formatScoreByModule(62, 'writing')).toBe('62')
      })

      it('should format high proficiency scores', () => {
        expect(formatScoreByModule(79, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(82, 'listening')).toBe('80-85')
        expect(formatScoreByModule(79, 'reading')).toBe('79')
        expect(formatScoreByModule(85, 'writing')).toBe('85')
      })

      it('should format competent user scores (PTE 50-58)', () => {
        expect(formatScoreByModule(50, 'speaking')).toBe('50-55')
        expect(formatScoreByModule(55, 'listening')).toBe('55-60')
        expect(formatScoreByModule(52, 'reading')).toBe('52')
        expect(formatScoreByModule(58, 'writing')).toBe('58')
      })

      it('should format proficient user scores (PTE 79+)', () => {
        expect(formatScoreByModule(79, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(80, 'listening')).toBe('80-85')
        expect(formatScoreByModule(84, 'reading')).toBe('84')
        expect(formatScoreByModule(82, 'writing')).toBe('82')
      })
    })
  })
})