/**
 * Unit tests for lib/assets.ts
 * Tests asset path utilities and helpers
 */

import { getAssetPath, getImagePath, getAudioPath, isValidAssetPath } from '@/lib/assets'

describe('lib/assets', () => {
  describe('getAssetPath', () => {
    it('should return correct path for asset', () => {
      const path = getAssetPath('test.png')
      expect(path).toBe('/assets/test.png')
    })

    it('should handle paths with subdirectories', () => {
      const path = getAssetPath('images/test.png')
      expect(path).toBe('/assets/images/test.png')
    })

    it('should not double slash', () => {
      const path = getAssetPath('/test.png')
      expect(path).not.toContain('//')
    })

    it('should handle empty string', () => {
      const path = getAssetPath('')
      expect(path).toBe('/assets/')
    })
  })

  describe('getImagePath', () => {
    it('should return correct path for images', () => {
      const path = getImagePath('logo.png')
      expect(path).toContain('/images/')
      expect(path).toContain('logo.png')
    })

    it('should handle different image formats', () => {
      expect(getImagePath('photo.jpg')).toContain('.jpg')
      expect(getImagePath('graphic.svg')).toContain('.svg')
      expect(getImagePath('icon.webp')).toContain('.webp')
    })
  })

  describe('getAudioPath', () => {
    it('should return correct path for audio files', () => {
      const path = getAudioPath('recording.mp3')
      expect(path).toContain('/audio/')
      expect(path).toContain('recording.mp3')
    })

    it('should handle different audio formats', () => {
      expect(getAudioPath('sound.wav')).toContain('.wav')
      expect(getAudioPath('voice.m4a')).toContain('.m4a')
      expect(getAudioPath('track.ogg')).toContain('.ogg')
    })
  })

  describe('isValidAssetPath', () => {
    it('should validate correct asset paths', () => {
      expect(isValidAssetPath('/assets/test.png')).toBe(true)
      expect(isValidAssetPath('/assets/images/photo.jpg')).toBe(true)
    })

    it('should reject invalid paths', () => {
      expect(isValidAssetPath('')).toBe(false)
      expect(isValidAssetPath('invalid')).toBe(false)
      expect(isValidAssetPath('../../../etc/passwd')).toBe(false)
    })

    it('should reject path traversal attempts', () => {
      expect(isValidAssetPath('/assets/../../../secrets')).toBe(false)
      expect(isValidAssetPath('/assets/./../../config')).toBe(false)
    })

    it('should accept safe nested paths', () => {
      expect(isValidAssetPath('/assets/images/pte/speaking/test.png')).toBe(true)
    })
  })
})