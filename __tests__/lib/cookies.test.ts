/**
 * Unit tests for lib/cookies.ts
 * Tests cookie management utilities
 */

import { parseCookies, serializeCookie, getCookieValue } from '@/lib/cookies'

describe('lib/cookies', () => {
  describe('parseCookies', () => {
    it('should parse simple cookie string', () => {
      const cookies = parseCookies('name=value')
      expect(cookies).toEqual({ name: 'value' })
    })

    it('should parse multiple cookies', () => {
      const cookies = parseCookies('name1=value1; name2=value2; name3=value3')
      expect(cookies).toEqual({
        name1: 'value1',
        name2: 'value2',
        name3: 'value3',
      })
    })

    it('should handle empty string', () => {
      const cookies = parseCookies('')
      expect(cookies).toEqual({})
    })

    it('should handle cookies with special characters', () => {
      const cookies = parseCookies('token=abc123-xyz; session=user%40example.com')
      expect(cookies.token).toBe('abc123-xyz')
    })

    it('should trim whitespace', () => {
      const cookies = parseCookies('  name1 = value1  ;  name2 = value2  ')
      expect(cookies).toEqual({
        name1: 'value1',
        name2: 'value2',
      })
    })

    it('should handle malformed cookies gracefully', () => {
      const cookies = parseCookies('invalidcookie; name=value')
      expect(cookies.name).toBe('value')
    })
  })

  describe('serializeCookie', () => {
    it('should serialize simple cookie', () => {
      const serialized = serializeCookie('name', 'value')
      expect(serialized).toContain('name=value')
    })

    it('should include maxAge option', () => {
      const serialized = serializeCookie('name', 'value', { maxAge: 3600 })
      expect(serialized).toContain('Max-Age=3600')
    })

    it('should include path option', () => {
      const serialized = serializeCookie('name', 'value', { path: '/' })
      expect(serialized).toContain('Path=/')
    })

    it('should include httpOnly flag', () => {
      const serialized = serializeCookie('name', 'value', { httpOnly: true })
      expect(serialized).toContain('HttpOnly')
    })

    it('should include secure flag', () => {
      const serialized = serializeCookie('name', 'value', { secure: true })
      expect(serialized).toContain('Secure')
    })

    it('should include sameSite option', () => {
      const serialized = serializeCookie('name', 'value', { sameSite: 'strict' })
      expect(serialized).toContain('SameSite=Strict')
    })

    it('should handle all options together', () => {
      const serialized = serializeCookie('session', 'abc123', {
        maxAge: 86400,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      })
      
      expect(serialized).toContain('session=abc123')
      expect(serialized).toContain('Max-Age=86400')
      expect(serialized).toContain('Path=/')
      expect(serialized).toContain('HttpOnly')
      expect(serialized).toContain('Secure')
      expect(serialized).toContain('SameSite=Lax')
    })
  })

  describe('getCookieValue', () => {
    it('should extract cookie value from string', () => {
      const value = getCookieValue('name1=value1; name2=value2', 'name2')
      expect(value).toBe('value2')
    })

    it('should return undefined for missing cookie', () => {
      const value = getCookieValue('name1=value1', 'name2')
      expect(value).toBeUndefined()
    })

    it('should handle empty cookie string', () => {
      const value = getCookieValue('', 'name')
      expect(value).toBeUndefined()
    })

    it('should be case sensitive', () => {
      const value = getCookieValue('Name=value', 'name')
      expect(value).toBeUndefined()
    })

    it('should handle cookies with similar names', () => {
      const value = getCookieValue('user=john; username=jane', 'user')
      expect(value).toBe('john')
    })
  })
})