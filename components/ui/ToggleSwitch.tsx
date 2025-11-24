'use client'

import { memo } from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const ToggleSwitch = memo(function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleSwitchProps) {
  const sizes = {
    sm: {
      switch: 'w-9 h-5',
      toggle: 'h-4 w-4',
      translate: checked ? 'translate-x-4' : 'translate-x-0',
    },
    md: {
      switch: 'w-11 h-6',
      toggle: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0',
    },
    lg: {
      switch: 'w-14 h-7',
      toggle: 'h-6 w-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0',
    },
  }

  const currentSize = sizes[size]

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`${currentSize.switch} relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          checked
            ? 'bg-blue-600'
            : 'bg-gray-200 dark:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          aria-hidden="true"
          className={`${currentSize.toggle} ${currentSize.translate} pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </button>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-gray-900 dark:text-white">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
})
