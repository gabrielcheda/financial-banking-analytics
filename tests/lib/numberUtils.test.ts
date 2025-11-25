import { describe, it, expect } from 'vitest'
import { parseLocaleNumber, parseLocaleInteger } from '@/lib/numberUtils'

describe('Number Utils', () => {
  describe('parseLocaleNumber', () => {
    it('should parse number values correctly', () => {
      expect(parseLocaleNumber(123.45)).toBe(123.45)
      expect(parseLocaleNumber(0)).toBe(0)
      expect(parseLocaleNumber(-500.25)).toBe(-500.25)
    })

    it('should parse string values with dot as decimal separator', () => {
      expect(parseLocaleNumber('123.45')).toBe(123.45)
      expect(parseLocaleNumber('1234.56')).toBe(1234.56)
      expect(parseLocaleNumber('0.5')).toBe(0.5)
    })

    it('should parse string values with comma as decimal separator', () => {
      expect(parseLocaleNumber('123,45')).toBe(123.45)
      expect(parseLocaleNumber('1234,56')).toBe(1234.56)
      expect(parseLocaleNumber('0,5')).toBe(0.5)
    })

    it('should handle strings with whitespace', () => {
      expect(parseLocaleNumber('1 234.56')).toBe(1234.56)
      expect(parseLocaleNumber('1 234,56')).toBe(1234.56)
      expect(parseLocaleNumber(' 123.45 ')).toBe(123.45)
    })

    it('should handle negative string values', () => {
      expect(parseLocaleNumber('-123.45')).toBe(-123.45)
      expect(parseLocaleNumber('-123,45')).toBe(-123.45)
    })

    it('should return undefined for null', () => {
      expect(parseLocaleNumber(null)).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      expect(parseLocaleNumber(undefined)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      expect(parseLocaleNumber('')).toBeUndefined()
    })

    it('should return undefined for invalid string', () => {
      expect(parseLocaleNumber('abc')).toBeUndefined()
      expect(parseLocaleNumber('invalid')).toBeUndefined()
      expect(parseLocaleNumber('12abc34')).toBeUndefined()
    })

    it('should return undefined for NaN number', () => {
      expect(parseLocaleNumber(NaN)).toBeUndefined()
    })

    it('should handle scientific notation', () => {
      expect(parseLocaleNumber('1.23e2')).toBe(123)
      expect(parseLocaleNumber('1.23e-2')).toBe(0.0123)
    })

    it('should handle very large numbers', () => {
      expect(parseLocaleNumber(999999999.99)).toBe(999999999.99)
      expect(parseLocaleNumber('999999999.99')).toBe(999999999.99)
    })

    it('should handle very small numbers', () => {
      expect(parseLocaleNumber(0.0001)).toBe(0.0001)
      expect(parseLocaleNumber('0.0001')).toBe(0.0001)
      expect(parseLocaleNumber('0,0001')).toBe(0.0001)
    })

    it('should handle decimal-only values', () => {
      expect(parseLocaleNumber('.5')).toBe(0.5)
      expect(parseLocaleNumber(',5')).toBe(0.5)
    })

    it('should return undefined for non-string, non-number values', () => {
      expect(parseLocaleNumber({})).toBeUndefined()
      expect(parseLocaleNumber([])).toBeUndefined()
      expect(parseLocaleNumber(true)).toBeUndefined()
      expect(parseLocaleNumber(false)).toBeUndefined()
    })
  })

  describe('parseLocaleInteger', () => {
    it('should parse number values and round correctly', () => {
      expect(parseLocaleInteger(123)).toBe(123)
      expect(parseLocaleInteger(123.45)).toBe(123)
      expect(parseLocaleInteger(123.56)).toBe(124)
      expect(parseLocaleInteger(0)).toBe(0)
    })

    it('should parse string values and round correctly', () => {
      expect(parseLocaleInteger('123')).toBe(123)
      expect(parseLocaleInteger('123.45')).toBe(123)
      expect(parseLocaleInteger('123.56')).toBe(124)
      expect(parseLocaleInteger('123,45')).toBe(123)
      expect(parseLocaleInteger('123,56')).toBe(124)
    })

    it('should handle negative values', () => {
      expect(parseLocaleInteger(-123.45)).toBe(-123)
      expect(parseLocaleInteger(-123.56)).toBe(-124)
      expect(parseLocaleInteger('-123.45')).toBe(-123)
      expect(parseLocaleInteger('-123,56')).toBe(-124)
    })

    it('should handle values with whitespace', () => {
      expect(parseLocaleInteger('1 234')).toBe(1234)
      expect(parseLocaleInteger('1 234.56')).toBe(1235)
      expect(parseLocaleInteger(' 123 ')).toBe(123)
    })

    it('should return undefined for null', () => {
      expect(parseLocaleInteger(null)).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      expect(parseLocaleInteger(undefined)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      expect(parseLocaleInteger('')).toBeUndefined()
    })

    it('should return undefined for invalid string', () => {
      expect(parseLocaleInteger('abc')).toBeUndefined()
      expect(parseLocaleInteger('invalid')).toBeUndefined()
    })

    it('should return undefined for NaN', () => {
      expect(parseLocaleInteger(NaN)).toBeUndefined()
    })

    it('should round .5 values using Math.round', () => {
      expect(parseLocaleInteger(0.5)).toBe(1)
      expect(parseLocaleInteger(1.5)).toBe(2)
      expect(parseLocaleInteger(2.5)).toBe(3)
      expect(Math.abs(parseLocaleInteger(-0.5) || 0)).toBe(0)
      expect(parseLocaleInteger(-1.5)).toBe(-1)
    })

    it('should handle very large integers', () => {
      expect(parseLocaleInteger(999999999)).toBe(999999999)
      expect(parseLocaleInteger('999999999')).toBe(999999999)
    })

    it('should handle decimal values that round to zero', () => {
      expect(parseLocaleInteger(0.1)).toBe(0)
      expect(parseLocaleInteger(0.4)).toBe(0)
      expect(Math.abs(parseLocaleInteger(-0.1) || 0)).toBe(0)
      expect(Math.abs(parseLocaleInteger('-0.4') || 0)).toBe(0)
    })
  })
})
