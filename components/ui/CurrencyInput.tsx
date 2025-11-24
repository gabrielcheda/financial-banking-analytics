'use client'

import { memo, useCallback } from 'react'
import { parseLocaleNumber } from '@/lib/numberUtils'

interface CurrencyInputProps {
  value: number | string
  onChange: (value: number) => void
  label?: string
  required?: boolean
  error?: string
  placeholder?: string
  currency?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

export const CurrencyInput = memo(function CurrencyInput({
  value,
  onChange,
  label,
  required = false,
  error,
  placeholder = '0.00',
  currency = '$',
  disabled = false,
  min,
  max,
  step = 0.01,
}: CurrencyInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty input
    if (inputValue === '') {
      onChange(0)
      return
    }

    // Parse the locale number (handles both comma and period separators)
    const parsed = parseLocaleNumber(inputValue)
    
    if (parsed !== undefined && !isNaN(parsed)) {
      // Apply min/max constraints
      let finalValue = parsed
      if (min !== undefined && finalValue < min) finalValue = min
      if (max !== undefined && finalValue > max) finalValue = max
      onChange(finalValue)
    }
  }, [onChange, min, max])

  const displayValue = typeof value === 'number' 
    ? value.toFixed(2).replace(/\.00$/, '') 
    : value

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
            {currency}
          </span>
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-7 pr-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})
