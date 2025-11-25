import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionForm } from '@/components/forms/TransactionForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: '1', name: 'Food', type: 'expense', icon: '🍔' },
      { id: '2', name: 'Salary', type: 'income', icon: '💰' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useAccounts', () => ({
  useActiveAccounts: () => ({
    data: [
      { id: '1', name: 'Checking', type: 'checking' },
      { id: '2', name: 'Savings', type: 'savings' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useMerchants', () => ({
  useMerchants: () => ({
    data: [],
    isLoading: false,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn()

  it('should render transaction type options', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.transaction.income/i)).toBeInTheDocument()
    expect(screen.getByText(/forms.transaction.expense/i)).toBeInTheDocument()
    expect(screen.getByText(/forms.transaction.transfer/i)).toBeInTheDocument()
  })

  it('should render description field', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.transaction.description/i)).toBeInTheDocument()
  })

  it('should render amount field', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.transaction.amount/i)).toBeInTheDocument()
  })

  it('should render date field', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.transaction.date/i)).toBeInTheDocument()
  })

  it('should render account and category selects', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.transaction.fromAccount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.transaction.category/i)).toBeInTheDocument()
  })

  it('should render status and merchant selects', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.transaction.status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.transaction.merchant/i)).toBeInTheDocument()
  })

  it('should render notes textarea', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.transaction.notes/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /forms.transaction.create/i })).toBeInTheDocument()
  })
})
