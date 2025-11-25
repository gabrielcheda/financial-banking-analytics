import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetForm } from '@/components/forms/BudgetForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: '1', name: 'Food', type: 'expense' },
      { id: '2', name: 'Transport', type: 'expense' },
    ],
    isLoading: false,
  }),
}))

describe('BudgetForm', () => {
  const mockOnSubmit = vi.fn()

  it('should render category select when not editing', () => {
    render(<BudgetForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByLabelText(/forms.budget.category/i)).toBeInTheDocument()
  })

  it('should render budget limit field', () => {
    render(<BudgetForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.budget.budgetLimit/i)).toBeInTheDocument()
  })

  it('should render period select when not editing', () => {
    render(<BudgetForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByLabelText(/forms.budget.period/i)).toBeInTheDocument()
  })

  it('should render start date when not editing', () => {
    render(<BudgetForm onSubmit={mockOnSubmit} isEditing={false} />)

    expect(screen.getByLabelText(/forms.budget.startDate/i)).toBeInTheDocument()
  })

  it('should render alerts section', () => {
    render(<BudgetForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.budget.budgetAlerts/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.budget.enableAlerts/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<BudgetForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /forms.budget.create/i })).toBeInTheDocument()
  })
})
