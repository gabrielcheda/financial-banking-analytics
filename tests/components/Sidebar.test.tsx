/**
 * Tests for Sidebar Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'
import { QueryProvider } from '@/components/QueryProvider'
import { I18nProvider } from '@/i18n'

// Mock hooks
vi.mock('@/hooks/useUser', () => ({
  useProfile: () => ({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
}))

vi.mock('@/hooks/usePrefetch', () => ({
  usePrefetch: () => ({
    prefetchDashboard: vi.fn(),
    prefetchTransactions: vi.fn(),
    prefetchAccounts: vi.fn(),
    prefetchBudgets: vi.fn(),
    prefetchBills: vi.fn(),
    prefetchGoals: vi.fn(),
    prefetchCategories: vi.fn(),
    prefetchMerchants: vi.fn(),
    prefetchAnalytics: vi.fn(),
    prefetchReports: vi.fn(),
    prefetchPlanning: vi.fn(),
    prefetchNotifications: vi.fn(),
    prefetchSettings: vi.fn(),
  }),
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryProvider>
      <I18nProvider initialLocale="en-US">
        {ui}
      </I18nProvider>
    </QueryProvider>
  )
}

describe('Sidebar', () => {
  describe('Rendering', () => {
    it('should render sidebar', () => {
      renderWithProviders(<Sidebar />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      renderWithProviders(<Sidebar />)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should render navigation icons', () => {
      renderWithProviders(<Sidebar />)
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have navigation landmark', () => {
      renderWithProviders(<Sidebar />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })
})
