import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider, useI18n } from '@/i18n/I18nProvider'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should provide i18n context to children', () => {
    const TestComponent = () => {
      const { locale, t } = useI18n()
      return (
        <div>
          <div>Locale: {locale}</div>
          <div>{t('common.welcome')}</div>
        </div>
      )
    }

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByText(/Locale:/)).toBeInTheDocument()
  })

  it('should have default locale as en', () => {
    const TestComponent = () => {
      const { locale } = useI18n()
      return <div>Locale: {locale}</div>
    }

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByText('Locale: en')).toBeInTheDocument()
  })

  it('should provide setLocale function', () => {
    const TestComponent = () => {
      const { setLocale } = useI18n()
      return <button onClick={() => setLocale('pt')}>Change Locale</button>
    }

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByRole('button', { name: 'Change Locale' })).toBeInTheDocument()
  })

  it('should provide translation function', () => {
    const TestComponent = () => {
      const { t } = useI18n()
      return <div>{t('test.key')}</div>
    }

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    // Translation function should return the key if translation not found
    expect(screen.getByText('test.key')).toBeInTheDocument()
  })

  it('should throw error when useI18n is used outside provider', () => {
    const TestComponent = () => {
      useI18n()
      return <div>Test</div>
    }

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow('useI18n must be used within I18nProvider')

    consoleError.mockRestore()
  })
})
