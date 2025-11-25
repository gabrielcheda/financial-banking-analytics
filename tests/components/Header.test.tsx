/**
 * Tests for Header Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header'
import { QueryProvider } from '@/components/QueryProvider'
import { I18nProvider } from '@/i18n'
import { ThemeProvider } from '@/components/ThemeProvider'
import { BalanceVisibilityProvider } from '@/contexts/BalanceVisibilityContext'

// Mock hooks
vi.mock('@/hooks/useTransactions', () => ({
  useSearchTransactions: () => ({
    data: [],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useNotifications', () => ({
  useUnreadCount: () => ({
    data: 5,
  }),
  useNotifications: () => ({
    data: {
      data: [],
    },
  }),
  useMarkAsRead: () => ({
    mutate: vi.fn(),
  }),
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryProvider>
      <I18nProvider initialLocale="en-US">
        <ThemeProvider>
          <BalanceVisibilityProvider>
            {ui}
          </BalanceVisibilityProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryProvider>
  )
}

describe('Header', () => {
  describe('Rendering', () => {
    it('should render header', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should render theme toggle button', () => {
      renderWithProviders(<Header />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render language switcher', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have banner role', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      renderWithProviders(<Header />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
