/**
 * Tests for TransactionCard Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionCard } from '@/components/TransactionCard'

// Mock dependencies
vi.mock('@/contexts/BalanceVisibilityContext', () => ({
  useBalanceVisibility: () => ({
    shouldShowBalance: true,
    isLoading: false,
  }),
}))

const mockTransaction = {
  id: '1',
  date: new Date('2024-01-15'),
  description: 'Grocery Shopping',
  category: 'Food',
  merchant: 'Whole Foods',
  amount: 125.50,
  type: 'expense' as const,
  status: 'completed' as const,
}

describe('TransactionCard', () => {
  it('should render description', () => {
    render(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
  })

  it('should render merchant', () => {
    render(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('Whole Foods')).toBeInTheDocument()
  })

  it('should render category', () => {
    render(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('should render status', () => {
    render(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('should show minus for expense', () => {
    render(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText(/-/)).toBeInTheDocument()
  })

  it('should show dash when no merchant', () => {
    const noMerchant = { ...mockTransaction, merchant: undefined }
    render(<TransactionCard transaction={noMerchant} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
