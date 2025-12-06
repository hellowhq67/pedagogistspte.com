import { countWords, mediaKindFromUrl, formatScoreByModule } from '../utils'

describe('lib/pte/utils', () => {
  describe('countWords', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2)
      expect(countWords('This is a test')).toBe(4)
    })

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1)
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(1) // split on empty string returns ['']
    })

    it('should handle strings with only whitespace', () => {
      expect(countWords('   ')).toBe(1)
    })

    it('should handle multiple spaces between words', () => {
      expect(countWords('Hello    world')).toBe(2)
      expect(countWords('One  two   three    four')).toBe(4)
    })

    it('should handle leading and trailing whitespace', () => {
      expect(countWords('  Hello world  ')).toBe(2)
      expect(countWords('\n\tHello world\t\n')).toBe(2)
    })

    it('should handle strings with tabs and newlines', () => {
      expect(countWords('Hello\tworld\ntest')).toBe(3)
      expect(countWords('Line1\nLine2\nLine3')).toBe(3)
    })

    it('should handle strings with punctuation', () => {
      expect(countWords('Hello, world!')).toBe(2)
      expect(countWords("Don't you think so?")).toBe(4)
    })

    it('should handle strings with numbers', () => {
      expect(countWords('I have 3 cats')).toBe(4)
      expect(countWords('123 456')).toBe(2)
    })

    it('should handle hyphenated words', () => {
      expect(countWords('well-known phrase')).toBe(2)
      expect(countWords('state-of-the-art technology')).toBe(2)
    })

    it('should handle very long text', () => {
      const longText = 'word '.repeat(1000).trim()
      expect(countWords(longText)).toBe(1000)
    })
  })

  describe('mediaKindFromUrl', () => {
    describe('audio files', () => {
      it('should detect .m4a files', () => {
        expect(mediaKindFromUrl('audio.m4a')).toBe('audio')
        expect(mediaKindFromUrl('/path/to/audio.m4a')).toBe('audio')
        expect(mediaKindFromUrl('https://example.com/audio.m4a')).toBe('audio')
      })

      it('should detect .mp3 files', () => {
        expect(mediaKindFromUrl('song.mp3')).toBe('audio')
        expect(mediaKindFromUrl('/music/song.mp3')).toBe('audio')
      })

      it('should detect .wav files', () => {
        expect(mediaKindFromUrl('recording.wav')).toBe('audio')
      })

      it('should detect .ogg files', () => {
        expect(mediaKindFromUrl('audio.ogg')).toBe('audio')
      })
    })

    describe('video files', () => {
      it('should detect .mp4 files', () => {
        expect(mediaKindFromUrl('video.mp4')).toBe('video')
        expect(mediaKindFromUrl('/videos/lecture.mp4')).toBe('video')
        expect(mediaKindFromUrl('https://cdn.example.com/video.mp4')).toBe('video')
      })

      it('should detect .webm files', () => {
        expect(mediaKindFromUrl('clip.webm')).toBe('video')
      })

      it('should detect .mov files', () => {
        expect(mediaKindFromUrl('recording.mov')).toBe('video')
      })
    })

    describe('image files', () => {
      it('should detect .jpg files', () => {
        expect(mediaKindFromUrl('photo.jpg')).toBe('image')
      })

      it('should detect .jpeg files', () => {
        expect(mediaKindFromUrl('photo.jpeg')).toBe('image')
      })

      it('should detect .png files', () => {
        expect(mediaKindFromUrl('screenshot.png')).toBe('image')
        expect(mediaKindFromUrl('/images/logo.png')).toBe('image')
      })

      it('should detect .gif files', () => {
        expect(mediaKindFromUrl('animation.gif')).toBe('image')
      })

      it('should detect .svg files', () => {
        expect(mediaKindFromUrl('icon.svg')).toBe('image')
      })

      it('should detect .webp files', () => {
        expect(mediaKindFromUrl('modern.webp')).toBe('image')
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

      it('should return unknown for files without extensions', () => {
        expect(mediaKindFromUrl('filename')).toBe('unknown')
        expect(mediaKindFromUrl('/path/to/file')).toBe('unknown')
      })

      it('should return unknown for unsupported extensions', () => {
        expect(mediaKindFromUrl('document.pdf')).toBe('unknown')
        expect(mediaKindFromUrl('archive.zip')).toBe('unknown')
        expect(mediaKindFromUrl('text.txt')).toBe('unknown')
      })

      it('should be case sensitive (extensions must be lowercase)', () => {
        expect(mediaKindFromUrl('AUDIO.MP3')).toBe('unknown')
        expect(mediaKindFromUrl('Video.MP4')).toBe('unknown')
        expect(mediaKindFromUrl('Image.PNG')).toBe('unknown')
      })

      it('should handle URLs with query parameters', () => {
        expect(mediaKindFromUrl('audio.mp3?token=abc123')).toBe('unknown')
        expect(mediaKindFromUrl('video.mp4#timestamp')).toBe('unknown')
      })

      it('should handle files with multiple dots', () => {
        expect(mediaKindFromUrl('file.backup.mp3')).toBe('audio')
        expect(mediaKindFromUrl('video.old.mp4')).toBe('video')
      })
    })
  })

  describe('formatScoreByModule', () => {
    describe('speaking module', () => {
      it('should format scores as ranges for speaking', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
        expect(formatScoreByModule(5, 'speaking')).toBe('5-10')
        expect(formatScoreByModule(10, 'speaking')).toBe('10-15')
        expect(formatScoreByModule(75, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(90, 'speaking')).toBe('90-95')
      })

      it('should round down to nearest 5 for speaking', () => {
        expect(formatScoreByModule(71, 'speaking')).toBe('70-75')
        expect(formatScoreByModule(72, 'speaking')).toBe('70-75')
        expect(formatScoreByModule(73, 'speaking')).toBe('70-75')
        expect(formatScoreByModule(74, 'speaking')).toBe('70-75')
        expect(formatScoreByModule(79, 'speaking')).toBe('75-80')
      })

      it('should handle edge values for speaking', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
        expect(formatScoreByModule(100, 'speaking')).toBe('100-105')
      })
    })

    describe('listening module', () => {
      it('should format scores as ranges for listening', () => {
        expect(formatScoreByModule(0, 'listening')).toBe('0-5')
        expect(formatScoreByModule(5, 'listening')).toBe('5-10')
        expect(formatScoreByModule(65, 'listening')).toBe('65-70')
        expect(formatScoreByModule(80, 'listening')).toBe('80-85')
      })

      it('should round down to nearest 5 for listening', () => {
        expect(formatScoreByModule(61, 'listening')).toBe('60-65')
        expect(formatScoreByModule(62, 'listening')).toBe('60-65')
        expect(formatScoreByModule(68, 'listening')).toBe('65-70')
        expect(formatScoreByModule(69, 'listening')).toBe('65-70')
      })
    })

    describe('reading module', () => {
      it('should return exact score for reading', () => {
        expect(formatScoreByModule(0, 'reading')).toBe('0')
        expect(formatScoreByModule(50, 'reading')).toBe('50')
        expect(formatScoreByModule(75, 'reading')).toBe('75')
        expect(formatScoreByModule(90, 'reading')).toBe('90')
      })

      it('should handle decimal scores for reading', () => {
        expect(formatScoreByModule(75.5, 'reading')).toBe('75.5')
        expect(formatScoreByModule(82.3, 'reading')).toBe('82.3')
      })
    })

    describe('writing module', () => {
      it('should return exact score for writing', () => {
        expect(formatScoreByModule(0, 'writing')).toBe('0')
        expect(formatScoreByModule(45, 'writing')).toBe('45')
        expect(formatScoreByModule(78, 'writing')).toBe('78')
        expect(formatScoreByModule(90, 'writing')).toBe('90')
      })

      it('should handle decimal scores for writing', () => {
        expect(formatScoreByModule(68.7, 'writing')).toBe('68.7')
        expect(formatScoreByModule(85.2, 'writing')).toBe('85.2')
      })
    })

    describe('null and undefined handling', () => {
      it('should return N/A for null scores', () => {
        expect(formatScoreByModule(null, 'speaking')).toBe('N/A')
        expect(formatScoreByModule(null, 'listening')).toBe('N/A')
        expect(formatScoreByModule(null, 'reading')).toBe('N/A')
        expect(formatScoreByModule(null, 'writing')).toBe('N/A')
      })

      it('should return N/A for undefined scores', () => {
        expect(formatScoreByModule(undefined as any, 'speaking')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'listening')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'reading')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'writing')).toBe('N/A')
      })
    })

    describe('boundary conditions', () => {
      it('should handle zero scores', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
        expect(formatScoreByModule(0, 'reading')).toBe('0')
      })

      it('should handle negative scores (edge case)', () => {
        expect(formatScoreByModule(-5, 'speaking')).toBe('-5--0')
        expect(formatScoreByModule(-10, 'reading')).toBe('-10')
      })

      it('should handle very large scores', () => {
        expect(formatScoreByModule(1000, 'speaking')).toBe('1000-1005')
        expect(formatScoreByModule(9999, 'reading')).toBe('9999')
      })
    })
  })
})