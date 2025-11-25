/**
 * Tests for VirtualTransactionList Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VirtualTransactionList } from '@/components/VirtualTransactionList'

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

const mockTransactions = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    description: 'Grocery Shopping',
    category: 'Food',
    merchant: 'Whole Foods',
    amount: 125.50,
    type: 'expense' as const,
    status: 'completed' as const,
  },
]

describe('VirtualTransactionList', () => {
  it('should render table headers', () => {
    render(<VirtualTransactionList transactions={mockTransactions} />)
    expect(screen.getByText(/transactions.description/)).toBeInTheDocument()
  })

  it('should show empty message when no transactions', () => {
    render(<VirtualTransactionList transactions={[]} />)
    expect(screen.getByText(/dashboard.noTransactionsFound/)).toBeInTheDocument()
  })

  it('should render virtual container', () => {
    const { container } = render(<VirtualTransactionList transactions={mockTransactions} />)
    const virtualContainer = container.querySelector('[style*="position: relative"]')
    expect(virtualContainer).toBeInTheDocument()
  })
})
