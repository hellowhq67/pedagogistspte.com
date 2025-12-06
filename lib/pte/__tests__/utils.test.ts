import { countWords, mediaKindFromUrl, formatScoreByModule } from '../utils'

describe('PTE Utils', () => {
  describe('countWords', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2)
      expect(countWords('The quick brown fox')).toBe(4)
    })

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1)
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(1) // split returns [''] for empty string
    })

    it('should handle strings with only whitespace', () => {
      expect(countWords('   ')).toBe(1)
    })

    it('should handle multiple spaces between words', () => {
      expect(countWords('Hello    world')).toBe(2)
      expect(countWords('One  two   three')).toBe(3)
    })

    it('should handle leading and trailing whitespace', () => {
      expect(countWords('  Hello world  ')).toBe(2)
    })

    it('should handle newlines and tabs', () => {
      expect(countWords('Hello\nworld')).toBe(2)
      expect(countWords('Hello\tworld')).toBe(2)
      expect(countWords('One\n\ntwo\t\tthree')).toBe(3)
    })

    it('should handle complex sentences with punctuation', () => {
      expect(countWords("Don't worry, it's fine.")).toBe(4)
      expect(countWords('Hello, world! How are you?')).toBe(5)
    })

    it('should handle very long text', () => {
      const longText = 'word '.repeat(1000).trim()
      expect(countWords(longText)).toBe(1000)
    })
  })

  describe('mediaKindFromUrl', () => {
    describe('audio files', () => {
      it('should identify m4a files', () => {
        expect(mediaKindFromUrl('audio.m4a')).toBe('audio')
        expect(mediaKindFromUrl('/path/to/file.m4a')).toBe('audio')
        expect(mediaKindFromUrl('https://example.com/audio.m4a')).toBe('audio')
      })

      it('should identify mp3 files', () => {
        expect(mediaKindFromUrl('song.mp3')).toBe('audio')
        expect(mediaKindFromUrl('/music/track.mp3')).toBe('audio')
      })

      it('should identify wav files', () => {
        expect(mediaKindFromUrl('recording.wav')).toBe('audio')
      })

      it('should identify ogg files', () => {
        expect(mediaKindFromUrl('podcast.ogg')).toBe('audio')
      })
    })

    describe('video files', () => {
      it('should identify mp4 files', () => {
        expect(mediaKindFromUrl('video.mp4')).toBe('video')
        expect(mediaKindFromUrl('/videos/lecture.mp4')).toBe('video')
      })

      it('should identify webm files', () => {
        expect(mediaKindFromUrl('clip.webm')).toBe('video')
      })

      it('should identify mov files', () => {
        expect(mediaKindFromUrl('movie.mov')).toBe('video')
      })
    })

    describe('image files', () => {
      it('should identify jpeg files', () => {
        expect(mediaKindFromUrl('photo.jpeg')).toBe('image')
        expect(mediaKindFromUrl('image.jpg')).toBe('image')
      })

      it('should identify png files', () => {
        expect(mediaKindFromUrl('screenshot.png')).toBe('image')
      })

      it('should identify gif files', () => {
        expect(mediaKindFromUrl('animation.gif')).toBe('image')
      })

      it('should identify svg files', () => {
        expect(mediaKindFromUrl('logo.svg')).toBe('image')
      })

      it('should identify webp files', () => {
        expect(mediaKindFromUrl('modern.webp')).toBe('image')
      })
    })

    describe('edge cases', () => {
      it('should return unknown for empty string', () => {
        expect(mediaKindFromUrl('')).toBe('unknown')
      })

      it('should return unknown for null-like input', () => {
        expect(mediaKindFromUrl(null as any)).toBe('unknown')
        expect(mediaKindFromUrl(undefined as any)).toBe('unknown')
      })

      it('should return unknown for unrecognized extensions', () => {
        expect(mediaKindFromUrl('file.txt')).toBe('unknown')
        expect(mediaKindFromUrl('document.pdf')).toBe('unknown')
        expect(mediaKindFromUrl('data.json')).toBe('unknown')
      })

      it('should handle URLs with query parameters', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3?v=123')).toBe('audio')
        expect(mediaKindFromUrl('/video.mp4?quality=high')).toBe('video')
      })

      it('should handle case sensitivity', () => {
        expect(mediaKindFromUrl('AUDIO.MP3')).toBe('unknown') // regex is case-sensitive
        expect(mediaKindFromUrl('Video.MP4')).toBe('unknown')
      })

      it('should handle files without extensions', () => {
        expect(mediaKindFromUrl('/path/to/file')).toBe('unknown')
        expect(mediaKindFromUrl('filename')).toBe('unknown')
      })

      it('should handle multiple dots in filename', () => {
        expect(mediaKindFromUrl('my.audio.file.mp3')).toBe('audio')
        expect(mediaKindFromUrl('test.video.clip.mp4')).toBe('video')
      })
    })
  })

  describe('formatScoreByModule', () => {
    describe('speaking module', () => {
      it('should format scores as ranges (5-point intervals)', () => {
        expect(formatScoreByModule(75, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(76, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(79, 'speaking')).toBe('75-80')
      })

      it('should handle edge case scores', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
        expect(formatScoreByModule(90, 'speaking')).toBe('90-95')
        expect(formatScoreByModule(50, 'speaking')).toBe('50-55')
      })

      it('should handle scores at range boundaries', () => {
        expect(formatScoreByModule(80, 'speaking')).toBe('80-85')
        expect(formatScoreByModule(85, 'speaking')).toBe('85-90')
      })
    })

    describe('listening module', () => {
      it('should format scores as ranges (same as speaking)', () => {
        expect(formatScoreByModule(65, 'listening')).toBe('65-70')
        expect(formatScoreByModule(82, 'listening')).toBe('80-85')
      })

      it('should handle full score range', () => {
        expect(formatScoreByModule(10, 'listening')).toBe('10-15')
        expect(formatScoreByModule(45, 'listening')).toBe('45-50')
        expect(formatScoreByModule(90, 'listening')).toBe('90-95')
      })
    })

    describe('reading module', () => {
      it('should return exact score as string', () => {
        expect(formatScoreByModule(75, 'reading')).toBe('75')
        expect(formatScoreByModule(82, 'reading')).toBe('82')
        expect(formatScoreByModule(90, 'reading')).toBe('90')
      })

      it('should handle all score values', () => {
        expect(formatScoreByModule(0, 'reading')).toBe('0')
        expect(formatScoreByModule(50, 'reading')).toBe('50')
        expect(formatScoreByModule(100, 'reading')).toBe('100')
      })
    })

    describe('writing module', () => {
      it('should return exact score as string', () => {
        expect(formatScoreByModule(75, 'writing')).toBe('75')
        expect(formatScoreByModule(88, 'writing')).toBe('88')
      })
    })

    describe('null and undefined handling', () => {
      it('should return N/A for null', () => {
        expect(formatScoreByModule(null, 'speaking')).toBe('N/A')
        expect(formatScoreByModule(null, 'reading')).toBe('N/A')
        expect(formatScoreByModule(null, 'writing')).toBe('N/A')
        expect(formatScoreByModule(null, 'listening')).toBe('N/A')
      })

      it('should return N/A for undefined', () => {
        expect(formatScoreByModule(undefined as any, 'speaking')).toBe('N/A')
        expect(formatScoreByModule(undefined as any, 'reading')).toBe('N/A')
      })
    })

    describe('boundary and edge cases', () => {
      it('should handle decimal scores correctly', () => {
        expect(formatScoreByModule(75.5, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(75.9, 'speaking')).toBe('75-80')
        expect(formatScoreByModule(75.1, 'reading')).toBe('75.1')
      })

      it('should handle negative scores', () => {
        expect(formatScoreByModule(-5, 'speaking')).toBe('-5--0')
        expect(formatScoreByModule(-10, 'reading')).toBe('-10')
      })

      it('should handle very large scores', () => {
        expect(formatScoreByModule(150, 'speaking')).toBe('150-155')
        expect(formatScoreByModule(200, 'reading')).toBe('200')
      })

      it('should handle zero scores', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5')
        expect(formatScoreByModule(0, 'reading')).toBe('0')
        expect(formatScoreByModule(0, 'writing')).toBe('0')
        expect(formatScoreByModule(0, 'listening')).toBe('0-5')
      })
    })
  })
})