/**
 * Tests for LanguageSwitcher Component
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { I18nProvider } from '@/i18n/I18nProvider'

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nProvider initialLocale="en">
      {component}
    </I18nProvider>
  )
}

describe('LanguageSwitcher', () => {
  describe('Rendering', () => {
    it('should render compact variant', () => {
      renderWithI18n(<LanguageSwitcher variant="compact" />)
      expect(document.querySelector('button')).toBeInTheDocument()
    })

    it('should render full variant', () => {
      renderWithI18n(<LanguageSwitcher variant="full" />)
      expect(document.querySelector('button')).toBeInTheDocument()
    })

    it('should render with default variant', () => {
      renderWithI18n(<LanguageSwitcher />)
      expect(document.querySelector('button')).toBeInTheDocument()
    })
  })
})
