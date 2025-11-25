import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBalanceFormatter } from '@/hooks/useBalanceFormatter'
import * as BalanceVisibilityContext from '@/contexts/BalanceVisibilityContext'

// Mock the context
vi.mock('@/contexts/BalanceVisibilityContext', () => ({
  useBalanceVisibility: vi.fn(),
}))

describe('useBalanceFormatter', () => {
  describe('formatBalance', () => {
    it('should format positive balance correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.56)

      expect(formatted).toBe('$1,234.56')
    })

    it('should format negative balance correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(-1234.56)

      expect(formatted).toBe('$1,234.56')
    })

    it('should format zero balance correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(0)

      expect(formatted).toBe('$0.00')
    })

    it('should show dots when balance is hidden', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: false,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.56)

      expect(formatted).toBe('••••')
    })

    it('should format with custom currency symbol', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.56, { currency: '€' })

      expect(formatted).toBe('€1,234.56')
    })

    it('should format with custom decimal places', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.5678, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })

      expect(formatted).toBe('$1,235')
    })

    it('should show sign for positive values when showSign is true', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.56, { showSign: true })

      expect(formatted).toBe('+$1,234.56')
    })

    it('should show sign for negative values when showSign is true', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(-1234.56, { showSign: true })

      expect(formatted).toBe('-$1,234.56')
    })

    it('should not show sign for zero when showSign is true', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(0, { showSign: true })

      expect(formatted).toBe('$0.00')
    })

    it('should format large numbers with thousands separator', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234567.89)

      expect(formatted).toBe('$1,234,567.89')
    })

    it('should format small numbers correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(0.01)

      expect(formatted).toBe('$0.01')
    })

    it('should handle multiple decimal places correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.567, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })

      expect(formatted).toBe('$1,234.567')
    })

    it('should combine all options correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(-1234.567, {
        showSign: true,
        currency: '£',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })

      expect(formatted).toBe('-£1,234.567')
    })

    it('should return dots when hidden regardless of options', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: false,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.56, {
        showSign: true,
        currency: '€',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })

      expect(formatted).toBe('••••')
    })
  })

  describe('shouldShowBalance', () => {
    it('should return true when balance is visible', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())

      expect(result.current.shouldShowBalance).toBe(true)
    })

    it('should return false when balance is hidden', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: false,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())

      expect(result.current.shouldShowBalance).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(999999999.99)

      expect(formatted).toBe('$999,999,999.99')
    })

    it('should handle very small numbers', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(0.0001, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })

      expect(formatted).toBe('$0.0001')
    })

    it('should handle rounding correctly', () => {
      vi.mocked(BalanceVisibilityContext.useBalanceVisibility).mockReturnValue({
        shouldShowBalance: true,
        toggleBalanceVisibility: vi.fn(),
      })

      const { result } = renderHook(() => useBalanceFormatter())
      const formatted = result.current.formatBalance(1234.999)

      expect(formatted).toBe('$1,235.00')
    })
  })
})
