/**
 * Tests for BalanceDisplay Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceDisplay } from '@/components/BalanceDisplay'

// Mock useBalanceVisibility
vi.mock('@/contexts/BalanceVisibilityContext', () => ({
  useBalanceVisibility: () => ({
    shouldShowBalance: true,
    isLoading: false,
    toggleBalanceVisibility: vi.fn(),
    isToggling: false,
  }),
}))

describe('BalanceDisplay', () => {
  it('should render amount when visible', () => {
    render(<BalanceDisplay amount={1000} />)
    expect(screen.getByText(/1,000/)).toBeInTheDocument()
  })

  it('should format with dollar sign', () => {
    render(<BalanceDisplay amount={100} />)
    expect(screen.getByText(/\$/)).toBeInTheDocument()
  })

  it('should show negative sign', () => {
    render(<BalanceDisplay amount={-500} showSign={true} />)
    expect(screen.getByText(/-/)).toBeInTheDocument()
  })

  it('should hide sign when showSign is false', () => {
    const { container } = render(<BalanceDisplay amount={-500} showSign={false} />)
    expect(container.textContent).toContain('500')
  })

  it('should show custom currency', () => {
    render(<BalanceDisplay amount={100} currency="EUR" />)
    expect(screen.getByText(/EUR/)).toBeInTheDocument()
  })
})
