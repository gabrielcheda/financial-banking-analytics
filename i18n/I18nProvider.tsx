'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { i18n, type Locale } from './config'
import en from './locales/en.json'
import pt from './locales/pt.json'

type Translations = typeof en

const translations: Record<Locale, Translations> = {
  en,
  pt,
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'bankdash-locale'

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.')
  let value = obj
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(i18n.defaultLocale)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize locale from storage or browser
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Try to get from localStorage
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      
      if (stored && i18n.locales.includes(stored)) {
        setLocaleState(stored)
      } else {
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0] as Locale
        if (i18n.locales.includes(browserLang)) {
          setLocaleState(browserLang)
        }
      }
    } catch (error) {
      console.error('Error loading locale:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
      
      // Update HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale
      }
    } catch (error) {
      console.error('Error saving locale:', error)
    }
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale], key)
    return interpolate(translation, params)
  }

  // Don't render children until locale is initialized to prevent flash of wrong language
  if (!isInitialized) {
    return null
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  
  if (context === undefined) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  
  return context
}
