/**
 * Unit tests for lib/pte/utils.ts
 * 
 * Tests cover:
 * - countWords function: various text inputs including edge cases
 * - mediaKindFromUrl function: file extension detection
 * - formatScoreByModule function: score formatting for different modules
 */

import { countWords, mediaKindFromUrl, formatScoreByModule } from '../utils';

describe('countWords', () => {
  describe('Happy Path', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2);
    });

    it('should count words in a longer sentence', () => {
      expect(countWords('The quick brown fox jumps over the lazy dog')).toBe(9);
    });

    it('should handle sentences with punctuation', () => {
      expect(countWords('Hello, world! How are you?')).toBe(5);
    });

    it('should count hyphenated words as single words', () => {
      expect(countWords('This is a well-known fact')).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should return 1 for a single word', () => {
      expect(countWords('Hello')).toBe(1);
    });

    it('should return 0 for an empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should return 0 for a string with only whitespace', () => {
      expect(countWords('   ')).toBe(0);
      expect(countWords('\t\n  ')).toBe(0);
    });

    it('should handle multiple spaces between words', () => {
      expect(countWords('Hello    world')).toBe(2);
      expect(countWords('One  two   three    four')).toBe(4);
    });

    it('should handle leading and trailing whitespace', () => {
      expect(countWords('  Hello world  ')).toBe(2);
      expect(countWords('\n\tHello world\n\t')).toBe(2);
    });

    it('should handle newlines and tabs', () => {
      expect(countWords('Hello\nworld\tthere')).toBe(3);
    });

    it('should count words with numbers', () => {
      expect(countWords('There are 123 apples')).toBe(4);
    });

    it('should handle special characters', () => {
      expect(countWords('Hello@world #test')).toBe(2);
    });
  });

  describe('Failure Conditions', () => {
    it('should handle very long strings', () => {
      const longString = 'word '.repeat(10000);
      expect(countWords(longString)).toBe(10000);
    });

    it('should handle strings with only special characters', () => {
      expect(countWords('!@#$%^&*()')).toBe(1);
    });

    it('should handle unicode characters', () => {
      expect(countWords('Hello 世界')).toBe(2);
      expect(countWords('café résumé')).toBe(2);
    });

    it('should handle emojis', () => {
      expect(countWords('Hello 👋 world 🌍')).toBe(4);
    });
  });
});

describe('mediaKindFromUrl', () => {
  describe('Audio Files', () => {
    it('should identify .m4a files as audio', () => {
      expect(mediaKindFromUrl('https://example.com/file.m4a')).toBe('audio');
    });

    it('should identify .mp3 files as audio', () => {
      expect(mediaKindFromUrl('https://example.com/audio.mp3')).toBe('audio');
    });

    it('should identify .wav files as audio', () => {
      expect(mediaKindFromUrl('/path/to/sound.wav')).toBe('audio');
    });

    it('should identify .ogg files as audio', () => {
      expect(mediaKindFromUrl('sound.ogg')).toBe('audio');
    });

    it('should be case-sensitive for extensions', () => {
      expect(mediaKindFromUrl('file.MP3')).toBe('unknown');
      expect(mediaKindFromUrl('file.Mp3')).toBe('unknown');
    });
  });

  describe('Video Files', () => {
    it('should identify .mp4 files as video', () => {
      expect(mediaKindFromUrl('https://example.com/video.mp4')).toBe('video');
    });

    it('should identify .webm files as video', () => {
      expect(mediaKindFromUrl('video.webm')).toBe('video');
    });

    it('should identify .mov files as video', () => {
      expect(mediaKindFromUrl('/path/to/clip.mov')).toBe('video');
    });
  });

  describe('Image Files', () => {
    it('should identify .jpg files as image', () => {
      expect(mediaKindFromUrl('https://example.com/photo.jpg')).toBe('image');
    });

    it('should identify .jpeg files as image', () => {
      expect(mediaKindFromUrl('photo.jpeg')).toBe('image');
    });

    it('should identify .png files as image', () => {
      expect(mediaKindFromUrl('image.png')).toBe('image');
    });

    it('should identify .gif files as image', () => {
      expect(mediaKindFromUrl('animation.gif')).toBe('image');
    });

    it('should identify .svg files as image', () => {
      expect(mediaKindFromUrl('icon.svg')).toBe('image');
    });

    it('should identify .webp files as image', () => {
      expect(mediaKindFromUrl('modern.webp')).toBe('image');
    });
  });

  describe('Edge Cases', () => {
    it('should return unknown for empty string', () => {
      expect(mediaKindFromUrl('')).toBe('unknown');
    });

    it('should return unknown for null-like inputs', () => {
      expect(mediaKindFromUrl(null as any)).toBe('unknown');
      expect(mediaKindFromUrl(undefined as any)).toBe('unknown');
    });

    it('should return unknown for files without extensions', () => {
      expect(mediaKindFromUrl('https://example.com/file')).toBe('unknown');
    });

    it('should return unknown for unrecognized extensions', () => {
      expect(mediaKindFromUrl('file.txt')).toBe('unknown');
      expect(mediaKindFromUrl('file.pdf')).toBe('unknown');
      expect(mediaKindFromUrl('file.doc')).toBe('unknown');
    });

    it('should handle URLs with query parameters', () => {
      expect(mediaKindFromUrl('https://example.com/audio.mp3?v=123')).toBe('unknown');
    });

    it('should handle URLs with fragments', () => {
      expect(mediaKindFromUrl('https://example.com/video.mp4#start')).toBe('unknown');
    });

    it('should handle complex paths', () => {
      expect(mediaKindFromUrl('https://cdn.example.com/path/to/media/file.m4a')).toBe('audio');
    });

    it('should handle relative paths', () => {
      expect(mediaKindFromUrl('./audio.mp3')).toBe('audio');
      expect(mediaKindFromUrl('../video.mp4')).toBe('video');
    });

    it('should handle file:// protocol', () => {
      expect(mediaKindFromUrl('file:///Users/test/audio.mp3')).toBe('audio');
    });
  });

  describe('Boundary Cases', () => {
    it('should handle multiple dots in filename', () => {
      expect(mediaKindFromUrl('my.audio.file.mp3')).toBe('audio');
    });

    it('should handle dots in path', () => {
      expect(mediaKindFromUrl('https://example.com/v1.0/audio.mp3')).toBe('audio');
    });

    it('should match extension at the end only', () => {
      expect(mediaKindFromUrl('mp3.file.txt')).toBe('unknown');
    });
  });
});

describe('formatScoreByModule', () => {
  describe('Speaking Module', () => {
    describe('Happy Path', () => {
      it('should format score 0 as 0-5', () => {
        expect(formatScoreByModule(0, 'speaking')).toBe('0-5');
      });

      it('should format score 5 as 5-10', () => {
        expect(formatScoreByModule(5, 'speaking')).toBe('5-10');
      });

      it('should format score 42 as 40-45', () => {
        expect(formatScoreByModule(42, 'speaking')).toBe('40-45');
      });

      it('should format score 77 as 75-80', () => {
        expect(formatScoreByModule(77, 'speaking')).toBe('75-80');
      });

      it('should format score 90 as 90-95', () => {
        expect(formatScoreByModule(90, 'speaking')).toBe('90-95');
      });
    });

    describe('Edge Cases', () => {
      it('should handle score at exact range boundaries', () => {
        expect(formatScoreByModule(10, 'speaking')).toBe('10-15');
        expect(formatScoreByModule(15, 'speaking')).toBe('15-20');
        expect(formatScoreByModule(20, 'speaking')).toBe('20-25');
      });

      it('should handle scores with decimals by flooring', () => {
        expect(formatScoreByModule(42.3, 'speaking')).toBe('40-45');
        expect(formatScoreByModule(42.7, 'speaking')).toBe('40-45');
        expect(formatScoreByModule(44.9, 'speaking')).toBe('40-45');
      });

      it('should handle very high scores', () => {
        expect(formatScoreByModule(100, 'speaking')).toBe('100-105');
        expect(formatScoreByModule(200, 'speaking')).toBe('200-205');
      });
    });

    describe('Null/Undefined Handling', () => {
      it('should return N/A for null score', () => {
        expect(formatScoreByModule(null, 'speaking')).toBe('N/A');
      });

      it('should return N/A for undefined score', () => {
        expect(formatScoreByModule(undefined as any, 'speaking')).toBe('N/A');
      });
    });
  });

  describe('Listening Module', () => {
    describe('Happy Path', () => {
      it('should format score 0 as 0-5', () => {
        expect(formatScoreByModule(0, 'listening')).toBe('0-5');
      });

      it('should format score 35 as 35-40', () => {
        expect(formatScoreByModule(35, 'listening')).toBe('35-40');
      });

      it('should format score 63 as 60-65', () => {
        expect(formatScoreByModule(63, 'listening')).toBe('60-65');
      });

      it('should format score 89 as 85-90', () => {
        expect(formatScoreByModule(89, 'listening')).toBe('85-90');
      });
    });

    describe('Edge Cases', () => {
      it('should handle scores with decimals', () => {
        expect(formatScoreByModule(37.2, 'listening')).toBe('35-40');
        expect(formatScoreByModule(37.8, 'listening')).toBe('35-40');
      });

      it('should handle very low scores', () => {
        expect(formatScoreByModule(1, 'listening')).toBe('0-5');
        expect(formatScoreByModule(4, 'listening')).toBe('0-5');
      });
    });

    describe('Null/Undefined Handling', () => {
      it('should return N/A for null score', () => {
        expect(formatScoreByModule(null, 'listening')).toBe('N/A');
      });

      it('should return N/A for undefined score', () => {
        expect(formatScoreByModule(undefined as any, 'listening')).toBe('N/A');
      });
    });
  });

  describe('Reading Module', () => {
    describe('Happy Path', () => {
      it('should format score as exact value', () => {
        expect(formatScoreByModule(0, 'reading')).toBe('0');
        expect(formatScoreByModule(42, 'reading')).toBe('42');
        expect(formatScoreByModule(75, 'reading')).toBe('75');
        expect(formatScoreByModule(90, 'reading')).toBe('90');
      });

      it('should preserve decimal scores as strings', () => {
        expect(formatScoreByModule(42.5, 'reading')).toBe('42.5');
        expect(formatScoreByModule(78.3, 'reading')).toBe('78.3');
      });
    });

    describe('Edge Cases', () => {
      it('should handle very high scores', () => {
        expect(formatScoreByModule(100, 'reading')).toBe('100');
        expect(formatScoreByModule(999, 'reading')).toBe('999');
      });

      it('should handle negative scores', () => {
        expect(formatScoreByModule(-5, 'reading')).toBe('-5');
      });

      it('should handle zero', () => {
        expect(formatScoreByModule(0, 'reading')).toBe('0');
      });
    });

    describe('Null/Undefined Handling', () => {
      it('should return N/A for null score', () => {
        expect(formatScoreByModule(null, 'reading')).toBe('N/A');
      });

      it('should return N/A for undefined score', () => {
        expect(formatScoreByModule(undefined as any, 'reading')).toBe('N/A');
      });
    });
  });

  describe('Writing Module', () => {
    describe('Happy Path', () => {
      it('should format score as exact value', () => {
        expect(formatScoreByModule(0, 'writing')).toBe('0');
        expect(formatScoreByModule(55, 'writing')).toBe('55');
        expect(formatScoreByModule(82, 'writing')).toBe('82');
        expect(formatScoreByModule(90, 'writing')).toBe('90');
      });

      it('should preserve decimal scores', () => {
        expect(formatScoreByModule(67.5, 'writing')).toBe('67.5');
        expect(formatScoreByModule(89.9, 'writing')).toBe('89.9');
      });
    });

    describe('Edge Cases', () => {
      it('should handle very high scores', () => {
        expect(formatScoreByModule(150, 'writing')).toBe('150');
      });

      it('should handle very precise decimals', () => {
        expect(formatScoreByModule(78.123456, 'writing')).toBe('78.123456');
      });
    });

    describe('Null/Undefined Handling', () => {
      it('should return N/A for null score', () => {
        expect(formatScoreByModule(null, 'writing')).toBe('N/A');
      });

      it('should return N/A for undefined score', () => {
        expect(formatScoreByModule(undefined as any, 'writing')).toBe('N/A');
      });
    });
  });

  describe('Cross-Module Consistency', () => {
    it('should handle the same score differently for different modules', () => {
      const score = 42;
      expect(formatScoreByModule(score, 'speaking')).toBe('40-45');
      expect(formatScoreByModule(score, 'listening')).toBe('40-45');
      expect(formatScoreByModule(score, 'reading')).toBe('42');
      expect(formatScoreByModule(score, 'writing')).toBe('42');
    });

    it('should handle boundary scores consistently', () => {
      const score = 85;
      expect(formatScoreByModule(score, 'speaking')).toBe('85-90');
      expect(formatScoreByModule(score, 'listening')).toBe('85-90');
      expect(formatScoreByModule(score, 'reading')).toBe('85');
      expect(formatScoreByModule(score, 'writing')).toBe('85');
    });
  });

  describe('Type Safety', () => {
    it('should handle module type variations', () => {
      const modules: Array<'speaking' | 'reading' | 'writing' | 'listening'> = [
        'speaking',
        'reading',
        'writing',
        'listening',
      ];

      modules.forEach((module) => {
        const result = formatScoreByModule(50, module);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Range Calculation Logic', () => {
    it('should correctly calculate range boundaries for speaking', () => {
      // Test all boundaries from 0-100
      const testCases = [
        { score: 0, expected: '0-5' },
        { score: 1, expected: '0-5' },
        { score: 4, expected: '0-5' },
        { score: 5, expected: '5-10' },
        { score: 9, expected: '5-10' },
        { score: 10, expected: '10-15' },
        { score: 24, expected: '20-25' },
        { score: 25, expected: '25-30' },
        { score: 49, expected: '45-50' },
        { score: 50, expected: '50-55' },
        { score: 74, expected: '70-75' },
        { score: 75, expected: '75-80' },
        { score: 95, expected: '95-100' },
      ];

      testCases.forEach(({ score, expected }) => {
        expect(formatScoreByModule(score, 'speaking')).toBe(expected);
      });
    });

    it('should handle edge case of exactly divisible by 5', () => {
      [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach((score) => {
        const result = formatScoreByModule(score, 'speaking');
        expect(result).toMatch(/^\d+-\d+$/);
        const [lower, upper] = result.split('-').map(Number);
        expect(upper - lower).toBe(5);
        expect(lower).toBe(score);
      });
    });
  });
});

describe('Pure Function Properties', () => {
  describe('countWords determinism', () => {
    it('should return the same result for the same input', () => {
      const input = 'Hello world this is a test';
      const result1 = countWords(input);
      const result2 = countWords(input);
      const result3 = countWords(input);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('mediaKindFromUrl determinism', () => {
    it('should return the same result for the same input', () => {
      const input = 'https://example.com/audio.mp3';
      const result1 = mediaKindFromUrl(input);
      const result2 = mediaKindFromUrl(input);
      const result3 = mediaKindFromUrl(input);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('formatScoreByModule determinism', () => {
    it('should return the same result for the same input', () => {
      const score = 77;
      const module = 'speaking';
      const result1 = formatScoreByModule(score, module);
      const result2 = formatScoreByModule(score, module);
      const result3 = formatScoreByModule(score, module);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});