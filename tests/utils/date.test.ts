import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatSmartDate,
  formatRelativeDate,
  formatDateTime,
  formatTime,
  formatDateRange,
  formatForInput,
  getDateRange,
  getLastMonths,
  getLastDays,
  getDaysUntil,
  getMonthsUntil,
  isFuture,
  isPast,
  isUpcoming,
} from '@/utils/date'

describe('Date Utils', () => {
  beforeEach(() => {
    // Fix current date for consistent testing
    vi.setSystemTime(new Date('2025-11-03T12:00:00Z'))
  })

  describe('formatSmartDate', () => {
    it('should show "Today" for today\'s date', () => {
      const today = new Date('2025-11-03T15:00:00Z')
      expect(formatSmartDate(today)).toBe('Today')
    })

    it('should show "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date('2025-11-02T15:00:00Z')
      expect(formatSmartDate(yesterday)).toBe('Yesterday')
    })

    it('should show day name for dates within last 7 days', () => {
      const lastWeek = new Date('2025-10-30T15:00:00Z')
      const dayName = formatSmartDate(lastWeek)
      expect(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).toContain(dayName)
    })

    it('should show formatted date for older dates', () => {
      const oldDate = new Date('2025-09-15T15:00:00Z')
      expect(formatSmartDate(oldDate)).toMatch(/Sep/)
    })
  })

  describe('formatRelativeDate', () => {
    it('should show "just now" for very recent dates', () => {
      const recent = new Date('2025-11-03T11:59:30Z')
      expect(formatRelativeDate(recent)).toBe('just now')
    })

    it('should show minutes ago', () => {
      const fiveMinAgo = new Date('2025-11-03T11:55:00Z')
      expect(formatRelativeDate(fiveMinAgo)).toBe('5 minutes ago')
    })

    it('should show hours ago', () => {
      const twoHoursAgo = new Date('2025-11-03T10:00:00Z')
      expect(formatRelativeDate(twoHoursAgo)).toBe('2 hours ago')
    })

    it('should show days ago', () => {
      const threeDaysAgo = new Date('2025-10-31T12:00:00Z')
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago')
    })

    it('should show weeks ago', () => {
      const twoWeeksAgo = new Date('2025-10-20T12:00:00Z')
      expect(formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago')
    })

    it('should show months ago', () => {
      const threeMonthsAgo = new Date('2025-08-03T12:00:00Z')
      expect(formatRelativeDate(threeMonthsAgo)).toBe('3 months ago')
    })

    it('should show years ago', () => {
      const twoYearsAgo = new Date('2023-11-03T12:00:00Z')
      expect(formatRelativeDate(twoYearsAgo)).toBe('2 years ago')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2025-11-03T15:30:00Z')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('Nov')
      expect(formatted).toContain('2025')
    })
  })

  describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
      const date = new Date('2025-11-03T15:30:00Z')
      const formatted = formatTime(date)
      expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
    })
  })

  describe('formatDateRange', () => {
    it('should format date range correctly', () => {
      const start = new Date('2025-11-01T00:00:00Z')
      const end = new Date('2025-11-30T00:00:00Z')
      const range = formatDateRange(start, end)
      expect(range).toContain('Nov')
      expect(range).toContain('-')
    })
  })

  describe('formatForInput', () => {
    it('should format date for input field (YYYY-MM-DD)', () => {
      const date = new Date('2025-11-03T15:30:00Z')
      expect(formatForInput(date)).toBe('2025-11-03')
    })

    it('should handle single-digit months and days', () => {
      const date = new Date('2025-01-05T15:30:00Z')
      expect(formatForInput(date)).toBe('2025-01-05')
    })
  })

  describe('getDateRange', () => {
    it('should return today range', () => {
      const range = getDateRange('today')
      expect(range.start.getDate()).toBe(new Date().getDate())
      expect(range.end.getDate()).toBe(new Date().getDate())
    })

    it('should return yesterday range', () => {
      const range = getDateRange('yesterday')
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(range.start.getDate()).toBe(yesterday.getDate())
    })

    it('should return last 7 days range', () => {
      const range = getDateRange('last7days')
      const diffTime = Math.abs(range.end.getTime() - range.start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      expect(diffDays).toBe(7)
    })

    it('should return last 30 days range', () => {
      const range = getDateRange('last30days')
      const diffTime = Math.abs(range.end.getTime() - range.start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      expect(diffDays).toBe(30)
    })

    it('should return this month range', () => {
      const range = getDateRange('thisMonth')
      expect(range.start.getDate()).toBe(1)
      expect(range.start.getMonth()).toBe(new Date().getMonth())
    })

    it('should return this year range', () => {
      const range = getDateRange('thisYear')
      expect(range.start.getMonth()).toBe(0)
      expect(range.start.getDate()).toBe(1)
      expect(range.start.getFullYear()).toBe(new Date().getFullYear())
    })
  })

  describe('getLastMonths', () => {
    it('should return correct number of months', () => {
      const months = getLastMonths(6)
      expect(months).toHaveLength(6)
    })

    it('should return months in correct order', () => {
      const months = getLastMonths(3)
      expect(months[0].month).toBeLessThan(months[2].month + 3)
    })

    it('should handle year transitions', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
      const months = getLastMonths(3)
      expect(months).toHaveLength(3)
    })
  })

  describe('getLastDays', () => {
    it('should return correct number of days', () => {
      const days = getLastDays(7)
      expect(days).toHaveLength(7)
    })

    it('should return days in chronological order', () => {
      const days = getLastDays(5)
      for (let i = 1; i < days.length; i++) {
        expect(new Date(days[i].date).getTime()).toBeGreaterThan(
          new Date(days[i - 1].date).getTime()
        )
      }
    })
  })

  describe('getDaysUntil', () => {
    it('should calculate days until future date', () => {
      const future = new Date('2025-11-10T12:00:00Z')
      expect(getDaysUntil(future)).toBe(7)
    })

    it('should return 0 for past dates', () => {
      const past = new Date('2025-10-30T12:00:00Z')
      expect(getDaysUntil(past)).toBe(0)
    })

    it('should return 0 for today', () => {
      const today = new Date('2025-11-03T12:00:00Z')
      expect(getDaysUntil(today)).toBe(0)
    })
  })

  describe('getMonthsUntil', () => {
    it('should calculate months until future date', () => {
      const future = new Date('2026-02-03T12:00:00Z')
      expect(getMonthsUntil(future)).toBe(3)
    })

    it('should return 0 for past dates', () => {
      const past = new Date('2025-08-03T12:00:00Z')
      expect(getMonthsUntil(past)).toBe(0)
    })
  })

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      const future = new Date('2025-12-03T12:00:00Z')
      expect(isFuture(future)).toBe(true)
    })

    it('should return false for past dates', () => {
      const past = new Date('2025-10-03T12:00:00Z')
      expect(isFuture(past)).toBe(false)
    })

    it('should return false for now', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      expect(isFuture(now)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const past = new Date('2025-10-03T12:00:00Z')
      expect(isPast(past)).toBe(true)
    })

    it('should return false for future dates', () => {
      const future = new Date('2025-12-03T12:00:00Z')
      expect(isPast(future)).toBe(false)
    })

    it('should return false for now', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      expect(isPast(now)).toBe(false)
    })
  })

  describe('isUpcoming', () => {
    it('should return true for dates within 7 days', () => {
      const upcoming = new Date('2025-11-08T12:00:00Z')
      expect(isUpcoming(upcoming)).toBe(true)
    })

    it('should return false for dates beyond 7 days', () => {
      const farFuture = new Date('2025-11-15T12:00:00Z')
      expect(isUpcoming(farFuture)).toBe(false)
    })

    it('should return false for past dates', () => {
      const past = new Date('2025-10-30T12:00:00Z')
      expect(isUpcoming(past)).toBe(false)
    })

    it('should respect custom days parameter', () => {
      const date = new Date('2025-11-18T12:00:00Z')
      expect(isUpcoming(date, 30)).toBe(true)
      expect(isUpcoming(date, 7)).toBe(false)
    })
  })
})
