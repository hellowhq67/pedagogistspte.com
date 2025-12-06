import { describe, it, expect } from 'vitest'
import { countWords, mediaKindFromUrl, formatScoreByModule } from './utils'

describe('countWords', () => {
  describe('happy paths', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2)
    })

    it('should count words in a longer sentence', () => {
      expect(countWords('The quick brown fox jumps over the lazy dog')).toBe(9)
    })

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1)
    })

    it('should handle text with punctuation', () => {
      expect(countWords('Hello, world! How are you?')).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0)
    })

    it('should return 0 for whitespace only', () => {
      expect(countWords('   ')).toBe(0)
    })

    it('should handle multiple spaces between words', () => {
      expect(countWords('Hello    world')).toBe(2)
    })

    it('should handle leading spaces', () => {
      expect(countWords('   Hello world')).toBe(2)
    })

    it('should handle trailing spaces', () => {
      expect(countWords('Hello world   ')).toBe(2)
    })

    it('should handle tabs and newlines', () => {
      expect(countWords('Hello\tworld\nfoo')).toBe(3)
    })

    it('should handle mixed whitespace', () => {
      expect(countWords('  Hello  \n\t  world  ')).toBe(2)
    })
  })

  describe('special characters', () => {
    it('should handle text with numbers', () => {
      expect(countWords('Hello 123 world 456')).toBe(4)
    })

    it('should handle hyphenated words as separate words', () => {
      expect(countWords('well-known state-of-the-art')).toBe(2)
    })

    it('should handle apostrophes', () => {
      expect(countWords("don't won't can't")).toBe(3)
    })

    it('should handle special characters', () => {
      expect(countWords('email@example.com test#hashtag $100')).toBe(3)
    })
  })
})

describe('mediaKindFromUrl', () => {
  describe('audio files', () => {
    it('should detect m4a files', () => {
      expect(mediaKindFromUrl('audio.m4a')).toBe('audio')
      expect(mediaKindFromUrl('https://example.com/file.m4a')).toBe('audio')
    })

    it('should detect mp3 files', () => {
      expect(mediaKindFromUrl('song.mp3')).toBe('audio')
      expect(mediaKindFromUrl('https://example.com/path/to/audio.mp3')).toBe('audio')
    })

    it('should detect wav files', () => {
      expect(mediaKindFromUrl('recording.wav')).toBe('audio')
    })

    it('should detect ogg files', () => {
      expect(mediaKindFromUrl('audio.ogg')).toBe('audio')
    })
  })

  describe('video files', () => {
    it('should detect mp4 files', () => {
      expect(mediaKindFromUrl('video.mp4')).toBe('video')
      expect(mediaKindFromUrl('https://example.com/video.mp4')).toBe('video')
    })

    it('should detect webm files', () => {
      expect(mediaKindFromUrl('video.webm')).toBe('video')
    })

    it('should detect mov files', () => {
      expect(mediaKindFromUrl('video.mov')).toBe('video')
    })
  })

  describe('image files', () => {
    it('should detect jpg files', () => {
      expect(mediaKindFromUrl('image.jpg')).toBe('image')
    })

    it('should detect jpeg files', () => {
      expect(mediaKindFromUrl('image.jpeg')).toBe('image')
    })

    it('should detect png files', () => {
      expect(mediaKindFromUrl('image.png')).toBe('image')
    })

    it('should detect gif files', () => {
      expect(mediaKindFromUrl('animation.gif')).toBe('image')
    })

    it('should detect svg files', () => {
      expect(mediaKindFromUrl('icon.svg')).toBe('image')
    })

    it('should detect webp files', () => {
      expect(mediaKindFromUrl('image.webp')).toBe('image')
    })
  })

  describe('edge cases', () => {
    it('should return unknown for empty string', () => {
      expect(mediaKindFromUrl('')).toBe('unknown')
    })

    it('should return unknown for null-like values', () => {
      expect(mediaKindFromUrl(null as any)).toBe('unknown')
      expect(mediaKindFromUrl(undefined as any)).toBe('unknown')
    })

    it('should return unknown for files without extension', () => {
      expect(mediaKindFromUrl('filename')).toBe('unknown')
      expect(mediaKindFromUrl('https://example.com/file')).toBe('unknown')
    })

    it('should return unknown for unsupported extensions', () => {
      expect(mediaKindFromUrl('document.pdf')).toBe('unknown')
      expect(mediaKindFromUrl('data.json')).toBe('unknown')
      expect(mediaKindFromUrl('style.css')).toBe('unknown')
    })

    it('should handle uppercase extensions', () => {
      expect(mediaKindFromUrl('AUDIO.MP3')).toBe('unknown') // regex is case-sensitive
      expect(mediaKindFromUrl('VIDEO.MP4')).toBe('unknown')
    })

    it('should handle URLs with query parameters', () => {
      expect(mediaKindFromUrl('https://example.com/audio.mp3?v=1')).toBe('unknown')
    })

    it('should handle complex URLs', () => {
      expect(mediaKindFromUrl('https://cdn.example.com/files/audio/recording.m4a')).toBe('audio')
    })

    it('should handle file paths', () => {
      expect(mediaKindFromUrl('/path/to/video.mp4')).toBe('video')
      expect(mediaKindFromUrl('./relative/path/image.png')).toBe('image')
    })

    it('should not match extensions in directory names', () => {
      expect(mediaKindFromUrl('https://example.com/audio.mp3/file')).toBe('unknown')
    })
  })
})

describe('formatScoreByModule', () => {
  describe('null and undefined handling', () => {
    it('should return N/A for null score', () => {
      expect(formatScoreByModule(null, 'speaking')).toBe('N/A')
      expect(formatScoreByModule(null, 'reading')).toBe('N/A')
      expect(formatScoreByModule(null, 'writing')).toBe('N/A')
      expect(formatScoreByModule(null, 'listening')).toBe('N/A')
    })

    it('should return N/A for undefined score', () => {
      expect(formatScoreByModule(undefined as any, 'speaking')).toBe('N/A')
      expect(formatScoreByModule(undefined as any, 'reading')).toBe('N/A')
      expect(formatScoreByModule(undefined as any, 'writing')).toBe('N/A')
      expect(formatScoreByModule(undefined as any, 'listening')).toBe('N/A')
    })
  })

  describe('speaking module', () => {
    it('should format scores as ranges divisible by 5', () => {
      expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
      expect(formatScoreByModule(5, 'speaking')).toBe('5-10')
      expect(formatScoreByModule(10, 'speaking')).toBe('10-15')
      expect(formatScoreByModule(50, 'speaking')).toBe('50-55')
      expect(formatScoreByModule(85, 'speaking')).toBe('85-90')
    })

    it('should round down to nearest 5 for non-divisible scores', () => {
      expect(formatScoreByModule(1, 'speaking')).toBe('0-5')
      expect(formatScoreByModule(2, 'speaking')).toBe('0-5')
      expect(formatScoreByModule(3, 'speaking')).toBe('0-5')
      expect(formatScoreByModule(4, 'speaking')).toBe('0-5')
      expect(formatScoreByModule(6, 'speaking')).toBe('5-10')
      expect(formatScoreByModule(7, 'speaking')).toBe('5-10')
      expect(formatScoreByModule(8, 'speaking')).toBe('5-10')
      expect(formatScoreByModule(9, 'speaking')).toBe('5-10')
    })

    it('should handle decimal scores', () => {
      expect(formatScoreByModule(12.3, 'speaking')).toBe('10-15')
      expect(formatScoreByModule(17.8, 'speaking')).toBe('15-20')
      expect(formatScoreByModule(73.5, 'speaking')).toBe('70-75')
    })

    it('should handle edge values', () => {
      expect(formatScoreByModule(90, 'speaking')).toBe('90-95')
      expect(formatScoreByModule(100, 'speaking')).toBe('100-105')
    })

    it('should handle negative scores', () => {
      expect(formatScoreByModule(-5, 'speaking')).toBe('-5-0')
      expect(formatScoreByModule(-3, 'speaking')).toBe('-5-0')
    })
  })

  describe('listening module', () => {
    it('should format scores as ranges divisible by 5', () => {
      expect(formatScoreByModule(0, 'listening')).toBe('0-5')
      expect(formatScoreByModule(5, 'listening')).toBe('5-10')
      expect(formatScoreByModule(10, 'listening')).toBe('10-15')
      expect(formatScoreByModule(50, 'listening')).toBe('50-55')
      expect(formatScoreByModule(85, 'listening')).toBe('85-90')
    })

    it('should round down to nearest 5 for non-divisible scores', () => {
      expect(formatScoreByModule(1, 'listening')).toBe('0-5')
      expect(formatScoreByModule(2, 'listening')).toBe('0-5')
      expect(formatScoreByModule(3, 'listening')).toBe('0-5')
      expect(formatScoreByModule(4, 'listening')).toBe('0-5')
      expect(formatScoreByModule(6, 'listening')).toBe('5-10')
      expect(formatScoreByModule(7, 'listening')).toBe('5-10')
    })

    it('should handle decimal scores', () => {
      expect(formatScoreByModule(23.7, 'listening')).toBe('20-25')
      expect(formatScoreByModule(68.2, 'listening')).toBe('65-70')
    })

    it('should handle edge values', () => {
      expect(formatScoreByModule(90, 'listening')).toBe('90-95')
      expect(formatScoreByModule(100, 'listening')).toBe('100-105')
    })
  })

  describe('reading module', () => {
    it('should return exact score as string', () => {
      expect(formatScoreByModule(0, 'reading')).toBe('0')
      expect(formatScoreByModule(50, 'reading')).toBe('50')
      expect(formatScoreByModule(75, 'reading')).toBe('75')
      expect(formatScoreByModule(90, 'reading')).toBe('90')
      expect(formatScoreByModule(100, 'reading')).toBe('100')
    })

    it('should handle decimal scores', () => {
      expect(formatScoreByModule(12.5, 'reading')).toBe('12.5')
      expect(formatScoreByModule(67.89, 'reading')).toBe('67.89')
      expect(formatScoreByModule(88.123, 'reading')).toBe('88.123')
    })

    it('should handle negative scores', () => {
      expect(formatScoreByModule(-10, 'reading')).toBe('-10')
    })

    it('should handle zero', () => {
      expect(formatScoreByModule(0, 'reading')).toBe('0')
    })
  })

  describe('writing module', () => {
    it('should return exact score as string', () => {
      expect(formatScoreByModule(0, 'writing')).toBe('0')
      expect(formatScoreByModule(45, 'writing')).toBe('45')
      expect(formatScoreByModule(80, 'writing')).toBe('80')
      expect(formatScoreByModule(90, 'writing')).toBe('90')
    })

    it('should handle decimal scores', () => {
      expect(formatScoreByModule(55.5, 'writing')).toBe('55.5')
      expect(formatScoreByModule(78.123, 'writing')).toBe('78.123')
    })

    it('should handle negative scores', () => {
      expect(formatScoreByModule(-5, 'writing')).toBe('-5')
    })

    it('should handle zero', () => {
      expect(formatScoreByModule(0, 'writing')).toBe('0')
    })
  })

  describe('consistency between modules', () => {
    it('should format speaking and listening identically', () => {
      const testScores = [0, 5, 10, 23, 47, 68, 90]
      testScores.forEach(score => {
        expect(formatScoreByModule(score, 'speaking')).toBe(
          formatScoreByModule(score, 'listening')
        )
      })
    })

    it('should format reading and writing identically', () => {
      const testScores = [0, 5, 10, 23.5, 47.8, 68.123, 90]
      testScores.forEach(score => {
        expect(formatScoreByModule(score, 'reading')).toBe(
          formatScoreByModule(score, 'writing')
        )
      })
    })

    it('should format differently between speaking/listening and reading/writing', () => {
      const score = 47
      expect(formatScoreByModule(score, 'speaking')).toBe('45-50')
      expect(formatScoreByModule(score, 'reading')).toBe('47')
    })
  })

  describe('boundary values', () => {
    it('should handle very large numbers', () => {
      expect(formatScoreByModule(999, 'speaking')).toBe('995-1000')
      expect(formatScoreByModule(1000, 'reading')).toBe('1000')
    })

    it('should handle very small decimals', () => {
      expect(formatScoreByModule(0.1, 'speaking')).toBe('0-5')
      expect(formatScoreByModule(0.001, 'reading')).toBe('0.001')
    })

    it('should handle Number.MAX_SAFE_INTEGER', () => {
      expect(formatScoreByModule(Number.MAX_SAFE_INTEGER, 'reading')).toBe(
        String(Number.MAX_SAFE_INTEGER)
      )
    })

    it('should handle extremely small negative numbers', () => {
      expect(formatScoreByModule(-100, 'speaking')).toBe('-100--95')
      expect(formatScoreByModule(-100, 'reading')).toBe('-100')
    })
  })
})