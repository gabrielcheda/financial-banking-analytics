import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCurrencyCompact,
  parseCurrency,
  getCurrencySymbol,
  formatPercentage,
  calculatePercentageChange,
  roundToNearest,
  getCurrencyColor,
} from '@/utils/currency'

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
      expect(formatCurrency(0, 'USD')).toBe('$0.00')
      expect(formatCurrency(-500.25, 'USD')).toBe('-$500.25')
    })

    it('should format EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR', 'en-US')).toBe('€1,234.56')
    })

    it('should format BRL currency correctly', () => {
      expect(formatCurrency(1234.56, 'BRL', 'pt-BR')).toContain('1.234,56')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567.89, 'USD')).toBe('$1,234,567.89')
    })

    it('should handle decimal precision', () => {
      expect(formatCurrency(10.1, 'USD')).toBe('$10.10')
      expect(formatCurrency(10.999, 'USD')).toBe('$11.00')
    })
  })

  describe('formatCurrencyCompact', () => {
    it('should format small numbers normally', () => {
      expect(formatCurrencyCompact(999)).toBe('$999.0')
    })

    it('should format thousands with K', () => {
      expect(formatCurrencyCompact(1000)).toBe('$1.0K')
      expect(formatCurrencyCompact(1500)).toBe('$1.5K')
      expect(formatCurrencyCompact(999999)).toBe('$1.0M')
    })

    it('should format millions with M', () => {
      expect(formatCurrencyCompact(1000000)).toBe('$1.0M')
      expect(formatCurrencyCompact(2500000)).toBe('$2.5M')
      expect(formatCurrencyCompact(999999999)).toBe('$1.0B')
    })

    it('should format billions with B', () => {
      expect(formatCurrencyCompact(1000000000)).toBe('$1.0B')
      expect(formatCurrencyCompact(5500000000)).toBe('$5.5B')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrencyCompact(-1500)).toBe('-$1.5K')
      expect(formatCurrencyCompact(-1000000)).toBe('-$1.0M')
    })

    it('should respect currency parameter', () => {
      expect(formatCurrencyCompact(1500, 'EUR')).toBe('€1.5K')
    })
  })

  describe('parseCurrency', () => {
    it('should parse currency strings correctly', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56)
      expect(parseCurrency('€1,234.56')).toBe(1234.56)
      expect(parseCurrency('1234.56')).toBe(1234.56)
    })

    it('should handle negative values', () => {
      expect(parseCurrency('-$500.25')).toBe(-500.25)
      expect(parseCurrency('($500.25)')).toBe(500.25)
    })

    it('should handle various formats', () => {
      expect(parseCurrency('$ 1,234.56')).toBe(1234.56)
      expect(parseCurrency('1.234,56')).toBe(1234.56)
      expect(parseCurrency('1 234.56')).toBe(1234.56)
    })

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('')).toBeNaN()
      expect(parseCurrency('invalid')).toBeNaN()
      expect(parseCurrency('abc123')).toBe(123)
    })

    it('should handle decimal-only values', () => {
      expect(parseCurrency('.56')).toBe(0.56)
      expect(parseCurrency('0.56')).toBe(0.56)
    })
  })

  describe('getCurrencySymbol', () => {
    it('should return correct currency symbols', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
      expect(getCurrencySymbol('EUR')).toBe('€')
      expect(getCurrencySymbol('GBP')).toBe('£')
      expect(getCurrencySymbol('JPY')).toBe('¥')
      expect(getCurrencySymbol('BRL')).toContain('R$')
    })

    it('should handle unknown currencies', () => {
      const symbol = getCurrencySymbol('XYZ')
      expect(symbol).toBeTruthy()
      expect(symbol.length).toBeGreaterThan(0)
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.5)).toBe('50.00%')
      expect(formatPercentage(0.1234)).toBe('12.34%')
      expect(formatPercentage(1)).toBe('100.00%')
      expect(formatPercentage(0)).toBe('0.00%')
    })

    it('should handle negative percentages', () => {
      expect(formatPercentage(-0.25)).toBe('-25.00%')
    })

    it('should respect decimal places parameter', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%')
      expect(formatPercentage(0.12345, 0)).toBe('12%')
      expect(formatPercentage(0.12345, 3)).toBe('12.345%')
    })

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.001)).toBe('0.10%')
      expect(formatPercentage(0.0001, 2)).toBe('0.01%')
    })
  })

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50)
      expect(calculatePercentageChange(50, 100)).toBe(100)
    })

    it('should calculate negative percentage change', () => {
      expect(calculatePercentageChange(100, 50)).toBe(-50)
      expect(calculatePercentageChange(200, 100)).toBe(-50)
    })

    it('should handle zero old value', () => {
      expect(calculatePercentageChange(0, 100)).toBe(100)
      expect(calculatePercentageChange(0, 0)).toBe(0)
    })

    it('should handle same values', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      expect(calculatePercentageChange(100, 133.333)).toBeCloseTo(33.33, 1)
      expect(calculatePercentageChange(100, 166.666)).toBeCloseTo(66.67, 1)
    })

    it('should handle negative values', () => {
      expect(calculatePercentageChange(-100, -50)).toBe(50)
      expect(calculatePercentageChange(-50, -100)).toBe(-100)
    })
  })

  describe('roundToNearest', () => {
    it('should round to nearest cent by default', () => {
      expect(roundToNearest(1.234, 0.01)).toBe(1.23)
      expect(roundToNearest(1.235, 0.01)).toBe(1.24)
      expect(roundToNearest(1.999, 1)).toBe(2)
    })

    it('should round to nearest dollar', () => {
      expect(roundToNearest(1.49, 1)).toBe(1)
      expect(roundToNearest(1.50, 1)).toBe(2)
      expect(roundToNearest(123.45, 1)).toBe(123)
    })

    it('should round to nearest 5', () => {
      expect(roundToNearest(12, 5)).toBe(10)
      expect(roundToNearest(13, 5)).toBe(15)
      expect(roundToNearest(17, 5)).toBe(15)
    })

    it('should round to nearest 10', () => {
      expect(roundToNearest(14, 10)).toBe(10)
      expect(roundToNearest(15, 10)).toBe(20)
      expect(roundToNearest(24, 10)).toBe(20)
    })

    it('should handle negative numbers', () => {
      expect(roundToNearest(-1.234, 0.01)).toBe(-1.23)
      expect(roundToNearest(-1.235, 0.01)).toBe(-1.24)
    })
  })

  describe('getCurrencyColor', () => {
    it('should return green for positive amounts', () => {
      expect(getCurrencyColor(100)).toBe('text-green-600 dark:text-green-400')
      expect(getCurrencyColor(0.01)).toBe('text-green-600 dark:text-green-400')
    })

    it('should return red for negative amounts', () => {
      expect(getCurrencyColor(-100)).toBe('text-red-600 dark:text-red-400')
      expect(getCurrencyColor(-0.01)).toBe('text-red-600 dark:text-red-400')
    })

    it('should return neutral for zero', () => {
      expect(getCurrencyColor(0)).toBe('text-gray-900 dark:text-white')
    })

    it('should use dark mode variants when specified', () => {
      expect(getCurrencyColor(100)).toBe('text-green-600 dark:text-green-400')
      expect(getCurrencyColor(-100)).toBe('text-red-600 dark:text-red-400')
      expect(getCurrencyColor(0)).toBe('text-gray-900 dark:text-white')
    })
  })
})
