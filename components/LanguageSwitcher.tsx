'use client'

import { useI18n } from '@/i18n/I18nProvider'
import { localeNames, localeFlags, type Locale } from '@/i18n/config'
import { Check, Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface LanguageSwitcherProps {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('common.changeLanguage')}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {isOpen && (
          <div className="fixed sm:absolute right-2 sm:right-0 mt-2 w-36 sm:w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50">
            <div className="py-1" role="menu">
              {Object.entries(localeNames).map(([code, name]) => {
                const localeCode = code as Locale
                const isActive = locale === localeCode

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleLocaleChange(localeCode)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    role="menuitem"
                  >
                    <span className="flex items-center gap-2">
                      <span>{localeFlags[localeCode]}</span>
                      <span>{name}</span>
                    </span>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
        aria-label={t('common.changeLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{localeFlags[locale]} {localeNames[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50">
          <div className="py-1" role="menu">
            {Object.entries(localeNames).map(([code, name]) => {
              const localeCode = code as Locale
              const isActive = locale === localeCode

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLocaleChange(localeCode)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    <span>{localeFlags[localeCode]}</span>
                    <span>{name}</span>
                  </span>
                  {isActive && <Check className="w-4 h-4" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
