'use client'

import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'

/**
 * Hook for formatting monetary values in chart tooltips and formatters
 * where React components cannot be used directly
 */
export function useBalanceFormatter() {
  const { shouldShowBalance } = useBalanceVisibility()

  /**
   * Formats a number as currency, respecting the balance visibility preference
   * @param value - The amount to format
   * @param options - Optional formatting options
   * @returns Formatted currency string or dots if hidden
   */
  const formatBalance = (
    value: number,
    options?: {
      showSign?: boolean
      currency?: string
      minimumFractionDigits?: number
      maximumFractionDigits?: number
    }
  ) => {
    if (!shouldShowBalance) {
      return '••••'
    }

    const {
      showSign = false,
      currency = '$',
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options || {}

    const absValue = Math.abs(value)
    const formatted = absValue.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    })

    const sign = showSign && value !== 0 ? (value >= 0 ? '+' : '-') : ''
    return `${sign}${currency}${formatted}`
  }

  return { formatBalance, shouldShowBalance }
}
