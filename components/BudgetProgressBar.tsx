'use client'

import { useMemo } from 'react'

interface BudgetProgressBarProps {
  spent: number
  limit: number
  currency?: string
  showTooltip?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function BudgetProgressBar({
  spent,
  limit,
  currency = '$',
  showTooltip = true,
  size = 'md',
}: BudgetProgressBarProps) {
  const percentage = useMemo(() => {
    if (limit === 0) return 0
    return Math.min((spent / limit) * 100, 100)
  }, [spent, limit])

  const remaining = useMemo(() => {
    return Math.max(limit - spent, 0)
  }, [spent, limit])

  const { color, bgColor, textColor } = useMemo(() => {
    if (percentage >= 90) {
      return {
        color: 'bg-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
      }
    } else if (percentage >= 70) {
      return {
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
      }
    } else {
      return {
        color: 'bg-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-200',
      }
    }
  }, [percentage])

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size]

  const formatCurrency = (amount: number) => {
    return `${currency}${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative group">
        <div className={`w-full ${bgColor} rounded-full overflow-hidden ${heightClass}`}>
          <div
            className={`${color} ${heightClass} rounded-full transition-all duration-300 ease-in-out`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget usage: ${percentage.toFixed(1)}%`}
          />
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-300">Spent:</span>
                  <span className="font-semibold">{formatCurrency(spent)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-300">Limit:</span>
                  <span className="font-semibold">{formatCurrency(limit)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-600 pt-1">
                  <span className="text-gray-300">Remaining:</span>
                  <span className={`font-semibold ${remaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(spent)} / {formatCurrency(limit)}
          </span>
          <span className={`font-semibold ${textColor}`}>
            ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {remaining > 0 ? (
            <span className="text-green-800 dark:text-green-200">
              {formatCurrency(remaining)} left
            </span>
          ) : (
            <span className="text-red-700 dark:text-red-300 font-semibold">
              {formatCurrency(Math.abs(remaining))} over
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
