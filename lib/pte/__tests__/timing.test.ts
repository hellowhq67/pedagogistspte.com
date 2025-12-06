import { ms, format } from '../timing'

describe('lib/pte/timing', () => {
  describe('ms helper functions', () => {
    describe('ms.s - seconds to milliseconds', () => {
      it('should convert seconds to milliseconds', () => {
        expect(ms.s(1)).toBe(1000)
        expect(ms.s(5)).toBe(5000)
        expect(ms.s(30)).toBe(30000)
        expect(ms.s(60)).toBe(60000)
      })

      it('should handle zero', () => {
        expect(ms.s(0)).toBe(0)
      })

      it('should handle decimal seconds', () => {
        expect(ms.s(0.5)).toBe(500)
        expect(ms.s(1.5)).toBe(1500)
        expect(ms.s(2.25)).toBe(2250)
      })

      it('should handle negative values (edge case)', () => {
        expect(ms.s(-1)).toBe(-1000)
        expect(ms.s(-5)).toBe(-5000)
      })

      it('should handle large values', () => {
        expect(ms.s(3600)).toBe(3600000) // 1 hour
        expect(ms.s(86400)).toBe(86400000) // 1 day
      })
    })

    describe('ms.m - minutes to milliseconds', () => {
      it('should convert minutes to milliseconds', () => {
        expect(ms.m(1)).toBe(60000)
        expect(ms.m(5)).toBe(300000)
        expect(ms.m(10)).toBe(600000)
        expect(ms.m(30)).toBe(1800000)
      })

      it('should handle zero', () => {
        expect(ms.m(0)).toBe(0)
      })

      it('should handle decimal minutes', () => {
        expect(ms.m(0.5)).toBe(30000) // 30 seconds
        expect(ms.m(1.5)).toBe(90000) // 1.5 minutes
        expect(ms.m(2.25)).toBe(135000)
      })

      it('should handle negative values (edge case)', () => {
        expect(ms.m(-1)).toBe(-60000)
        expect(ms.m(-5)).toBe(-300000)
      })

      it('should handle large values', () => {
        expect(ms.m(60)).toBe(3600000) // 1 hour
        expect(ms.m(1440)).toBe(86400000) // 1 day
      })
    })

    describe('combined usage', () => {
      it('should allow combining seconds and minutes', () => {
        const twoMinutesThirtySeconds = ms.m(2) + ms.s(30)
        expect(twoMinutesThirtySeconds).toBe(150000)
      })

      it('should calculate complex durations', () => {
        const duration = ms.m(10) + ms.s(45)
        expect(duration).toBe(645000)
      })
    })
  })

  describe('format - duration formatting', () => {
    describe('seconds formatting (< 1 minute)', () => {
      it('should format seconds as mm:ss', () => {
        expect(format(0)).toBe('00:00')
        expect(format(1000)).toBe('00:01')
        expect(format(5000)).toBe('00:05')
        expect(format(30000)).toBe('00:30')
        expect(format(59000)).toBe('00:59')
      })

      it('should handle milliseconds by rounding down', () => {
        expect(format(1500)).toBe('00:01')
        expect(format(1999)).toBe('00:01')
        expect(format(5500)).toBe('00:05')
      })
    })

    describe('minutes formatting (< 1 hour)', () => {
      it('should format minutes as mm:ss', () => {
        expect(format(60000)).toBe('01:00')
        expect(format(120000)).toBe('02:00')
        expect(format(300000)).toBe('05:00')
        expect(format(600000)).toBe('10:00')
        expect(format(3540000)).toBe('59:00')
      })

      it('should format minutes and seconds', () => {
        expect(format(90000)).toBe('01:30')
        expect(format(125000)).toBe('02:05')
        expect(format(665000)).toBe('11:05')
        expect(format(3599000)).toBe('59:59')
      })
    })

    describe('hours formatting (>= 1 hour)', () => {
      it('should format hours as hh:mm:ss', () => {
        expect(format(3600000)).toBe('01:00:00')
        expect(format(7200000)).toBe('02:00:00')
        expect(format(10800000)).toBe('03:00:00')
      })

      it('should format hours with minutes', () => {
        expect(format(3660000)).toBe('01:01:00')
        expect(format(5400000)).toBe('01:30:00')
        expect(format(7380000)).toBe('02:03:00')
      })

      it('should format hours with minutes and seconds', () => {
        expect(format(3665000)).toBe('01:01:05')
        expect(format(3723000)).toBe('01:02:03')
        expect(format(7384000)).toBe('02:03:04')
      })

      it('should handle long durations', () => {
        expect(format(36000000)).toBe('10:00:00')
        expect(format(86400000)).toBe('24:00:00')
        expect(format(359999000)).toBe('99:59:59')
      })
    })

    describe('edge cases', () => {
      it('should handle negative durations as zero', () => {
        expect(format(-1000)).toBe('00:00')
        expect(format(-60000)).toBe('00:00')
      })

      it('should pad single digits with zeros', () => {
        expect(format(1000)).toBe('00:01')
        expect(format(61000)).toBe('01:01')
        expect(format(3661000)).toBe('01:01:01')
      })

      it('should handle zero duration', () => {
        expect(format(0)).toBe('00:00')
      })

      it('should handle very large durations', () => {
        expect(format(999999000)).toBe('277:46:39')
      })
    })

    describe('real-world PTE timing examples', () => {
      it('should format typical speaking prep time (30-40 seconds)', () => {
        expect(format(30000)).toBe('00:30')
        expect(format(40000)).toBe('00:40')
      })

      it('should format typical speaking answer time (40 seconds)', () => {
        expect(format(40000)).toBe('00:40')
      })

      it('should format writing essay time (20 minutes)', () => {
        expect(format(1200000)).toBe('20:00')
      })

      it('should format summarize written text time (10 minutes)', () => {
        expect(format(600000)).toBe('10:00')
      })

      it('should format reading section time (29-30 minutes)', () => {
        expect(format(1740000)).toBe('29:00')
        expect(format(1800000)).toBe('30:00')
      })

      it('should format listening section time (30-43 minutes)', () => {
        expect(format(1800000)).toBe('30:00')
        expect(format(2580000)).toBe('43:00')
      })
    })
  })
})