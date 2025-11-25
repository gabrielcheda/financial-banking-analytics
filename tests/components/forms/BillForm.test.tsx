import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BillForm } from '@/components/forms/BillForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useMerchants', () => ({
  useMerchants: () => ({
    data: [{ id: '1', name: 'Electric Company', categoryId: '1' }],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: '1', name: 'Utilities', type: 'expense' }],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useAccounts', () => ({
  useActiveAccounts: () => ({
    data: [{ id: '1', name: 'Checking', accountNumber: '1234' }],
    isLoading: false,
  }),
}))

describe('BillForm', () => {
  const mockOnSubmit = vi.fn()

  it('should render bill name field when not editing', () => {
    render(<BillForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByLabelText(/forms.bill.billName/i)).toBeInTheDocument()
  })

  it('should render amount field', () => {
    render(<BillForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.bill.amount/i)).toBeInTheDocument()
  })

  it('should render category, merchant and account selects when not editing', () => {
    render(<BillForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByLabelText(/forms.bill.category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.bill.merchant/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.bill.paymentAccount/i)).toBeInTheDocument()
  })

  it('should render due date when not editing', () => {
    render(<BillForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByLabelText(/forms.bill.dueDate/i)).toBeInTheDocument()
  })

  it('should render recurring section when not editing', () => {
    render(<BillForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByText(/forms.bill.recurringBill/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.bill.isRecurring/i)).toBeInTheDocument()
  })

  it('should render reminders section when not editing', () => {
    render(<BillForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByText(/forms.bill.reminders/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.bill.enableReminders/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<BillForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /forms.bill.create/i })).toBeInTheDocument()
  })
})
