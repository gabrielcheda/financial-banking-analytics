'use client'

import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'

interface BalanceDisplayProps {
  amount: number
  currency?: string
  className?: string
  showSign?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export function BalanceDisplay({
  amount,
  currency = 'USD',
  className = '',
  showSign = true,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: BalanceDisplayProps) {
  const { shouldShowBalance, isLoading } = useBalanceVisibility()

  if (isLoading) {
    return <span className={className}>--</span>
  }

  if (!shouldShowBalance) {
    return <span className={className}>••••</span>
  }

  const sign = showSign ? (amount >= 0 ? '' : '-') : ''
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return (
    <span className={className}>
      {sign}${formattedAmount}
      {currency !== 'USD' && ` ${currency}`}
    </span>
  )
}
