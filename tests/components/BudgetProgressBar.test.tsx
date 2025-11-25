/**
 * Tests for BudgetProgressBar Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetProgressBar } from '@/components/BudgetProgressBar'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/contexts/BalanceVisibilityContext', () => ({
  useBalanceVisibility: () => ({
    shouldShowBalance: true,
    isLoading: false,
  }),
}))

describe('BudgetProgressBar', () => {
  it('should render progressbar', () => {
    render(<BudgetProgressBar spent={50} limit={100} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should calculate percentage correctly', () => {
    render(<BudgetProgressBar spent={50} limit={100} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
  })

  it('should cap at 100%', () => {
    render(<BudgetProgressBar spent={150} limit={100} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })

  it('should display percentage text', () => {
    render(<BudgetProgressBar spent={25} limit={100} />)
    expect(screen.getByText(/25.0%/)).toBeInTheDocument()
  })

  it('should have proper ARIA attributes', () => {
    render(<BudgetProgressBar spent={50} limit={100} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    expect(progressBar).toHaveAttribute('aria-label')
  })
})
