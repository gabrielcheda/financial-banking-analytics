'use client'

import { memo } from 'react'
import { useI18n } from '@/i18n'

export const PRESET_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
] as const

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  required?: boolean
  error?: string
  colors?: readonly string[]
  allowCustom?: boolean
}

export const ColorPicker = memo(function ColorPicker({
  value,
  onChange,
  label = 'Color',
  required = false,
  error,
  colors = PRESET_COLORS,
  allowCustom = true,
}: ColorPickerProps) {
  const { t } = useI18n()
  
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-8 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-10 h-10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              value === color
                ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            title={color}
          >
            {value === color && (
              <span className="sr-only">{t('common.selected')}</span>
            )}
          </button>
        ))}
      </div>
      
      {allowCustom && (
        <div className="mt-3">
          <label htmlFor="customColor" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Or enter custom hex color:
          </label>
          <input
            type="text"
            id="customColor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#10b981"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})
