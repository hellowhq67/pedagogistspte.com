/**
 * Comprehensive tests for PTE utility functions
 * Testing word counting, media detection, and score formatting
 */

import { countWords, mediaKindFromUrl, formatScoreByModule } from '@/lib/pte/utils';

describe('PTE Utilities', () => {
  describe('countWords()', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('The quick brown fox')).toBe(4);
    });

    it('should handle multiple spaces', () => {
      expect(countWords('Hello    world')).toBe(2);
      expect(countWords('Multiple   spaces   between   words')).toBe(4);
    });

    it('should handle leading and trailing spaces', () => {
      expect(countWords('  Hello world  ')).toBe(2);
      expect(countWords('   Trimmed   ')).toBe(1);
    });

    it('should handle empty strings', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });

    it('should handle newlines and tabs', () => {
      expect(countWords('Hello\nworld')).toBe(2);
      expect(countWords('Hello\tworld\ntest')).toBe(3);
    });

    it('should handle punctuation', () => {
      expect(countWords('Hello, world!')).toBe(2);
      expect(countWords("It's a beautiful day.")).toBe(4);
    });

    it('should handle numbers', () => {
      expect(countWords('I have 2 cats')).toBe(4);
      expect(countWords('Test 123 456')).toBe(3);
    });
  });

  describe('mediaKindFromUrl()', () => {
    describe('Audio files', () => {
      it('should detect .mp3 files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3')).toBe('audio');
      });

      it('should detect .m4a files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.m4a')).toBe('audio');
      });

      it('should detect .wav files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.wav')).toBe('audio');
      });

      it('should detect .ogg files', () => {
        expect(mediaKindFromUrl('https://example.com/audio.ogg')).toBe('audio');
      });
    });

    describe('Video files', () => {
      it('should detect .mp4 files', () => {
        expect(mediaKindFromUrl('https://example.com/video.mp4')).toBe('video');
      });

      it('should detect .webm files', () => {
        expect(mediaKindFromUrl('https://example.com/video.webm')).toBe('video');
      });

      it('should detect .mov files', () => {
        expect(mediaKindFromUrl('https://example.com/video.mov')).toBe('video');
      });
    });

    describe('Image files', () => {
      it('should detect .jpg files', () => {
        expect(mediaKindFromUrl('https://example.com/image.jpg')).toBe('image');
      });

      it('should detect .jpeg files', () => {
        expect(mediaKindFromUrl('https://example.com/image.jpeg')).toBe('image');
      });

      it('should detect .png files', () => {
        expect(mediaKindFromUrl('https://example.com/image.png')).toBe('image');
      });

      it('should detect .gif files', () => {
        expect(mediaKindFromUrl('https://example.com/image.gif')).toBe('image');
      });

      it('should detect .svg files', () => {
        expect(mediaKindFromUrl('https://example.com/image.svg')).toBe('image');
      });

      it('should detect .webp files', () => {
        expect(mediaKindFromUrl('https://example.com/image.webp')).toBe('image');
      });
    });

    describe('Edge cases', () => {
      it('should return unknown for empty URL', () => {
        expect(mediaKindFromUrl('')).toBe('unknown');
      });

      it('should return unknown for unknown extensions', () => {
        expect(mediaKindFromUrl('https://example.com/file.txt')).toBe('unknown');
        expect(mediaKindFromUrl('https://example.com/file.pdf')).toBe('unknown');
      });

      it('should be case-insensitive', () => {
        expect(mediaKindFromUrl('https://example.com/audio.MP3')).toBe('audio');
        expect(mediaKindFromUrl('https://example.com/video.MP4')).toBe('video');
      });

      it('should handle URLs with query parameters', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3?param=value')).toBe('audio');
      });

      it('should handle complex URLs', () => {
        expect(mediaKindFromUrl('https://cdn.example.com/path/to/media/audio.mp3#fragment')).toBe('audio');
      });
    });
  });

  describe('formatScoreByModule()', () => {
    describe('Speaking module', () => {
      it('should format speaking scores as ranges', () => {
        expect(formatScoreByModule(72, 'speaking')).toBe('70-75');
        expect(formatScoreByModule(78, 'speaking')).toBe('75-80');
        expect(formatScoreByModule(85, 'speaking')).toBe('85-90');
      });

      it('should handle boundary values', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5');
        expect(formatScoreByModule(90, 'speaking')).toBe('90-95');
        expect(formatScoreByModule(5, 'speaking')).toBe('5-10');
      });

      it('should handle scores at exact multiples of 5', () => {
        expect(formatScoreByModule(75, 'speaking')).toBe('75-80');
        expect(formatScoreByModule(80, 'speaking')).toBe('80-85');
      });
    });

    describe('Listening module', () => {
      it('should format listening scores as ranges', () => {
        expect(formatScoreByModule(67, 'listening')).toBe('65-70');
        expect(formatScoreByModule(81, 'listening')).toBe('80-85');
      });
    });

    describe('Reading module', () => {
      it('should format reading scores as exact numbers', () => {
        expect(formatScoreByModule(75, 'reading')).toBe('75');
        expect(formatScoreByModule(82, 'reading')).toBe('82');
        expect(formatScoreByModule(90, 'reading')).toBe('90');
      });

      it('should handle zero and low scores', () => {
        expect(formatScoreByModule(0, 'reading')).toBe('0');
        expect(formatScoreByModule(15, 'reading')).toBe('15');
      });
    });

    describe('Writing module', () => {
      it('should format writing scores as exact numbers', () => {
        expect(formatScoreByModule(68, 'writing')).toBe('68');
        expect(formatScoreByModule(85, 'writing')).toBe('85');
      });
    });

    describe('Null and undefined handling', () => {
      it('should return N/A for null scores', () => {
        expect(formatScoreByModule(null, 'speaking')).toBe('N/A');
        expect(formatScoreByModule(null, 'reading')).toBe('N/A');
        expect(formatScoreByModule(null, 'writing')).toBe('N/A');
        expect(formatScoreByModule(null, 'listening')).toBe('N/A');
      });

      it('should return N/A for undefined scores', () => {
        expect(formatScoreByModule(undefined as any, 'speaking')).toBe('N/A');
        expect(formatScoreByModule(undefined as any, 'reading')).toBe('N/A');
      });
    });

    describe('Edge cases', () => {
      it('should handle decimal scores', () => {
        expect(formatScoreByModule(72.5, 'speaking')).toBe('70-75');
        expect(formatScoreByModule(72.8, 'reading')).toBe('72.8');
      });

      it('should handle negative scores gracefully', () => {
        expect(formatScoreByModule(-5, 'speaking')).toBe('-5--0');
        expect(formatScoreByModule(-5, 'reading')).toBe('-5');
      });

      it('should handle very high scores', () => {
        expect(formatScoreByModule(100, 'speaking')).toBe('100-105');
        expect(formatScoreByModule(100, 'reading')).toBe('100');
      });
    });
  });
});