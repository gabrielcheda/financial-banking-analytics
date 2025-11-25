import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContributeForm } from '@/components/forms/ContributeForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useAccounts', () => ({
  useActiveAccounts: () => ({
    data: [{ id: '1', name: 'Savings', balance: 1000 }],
    isLoading: false,
  }),
}))

vi.mock('@/components/BalanceDisplay', () => ({
  BalanceDisplay: ({ amount }: { amount: number }) => <span>${amount}</span>,
}))

vi.mock('lucide-react', () => ({
  TrendingUp: () => <div>TrendingUp</div>,
  DollarSign: () => <div>DollarSign</div>,
}))

describe('ContributeForm', () => {
  const mockGoal = {
    id: '1',
    name: 'Vacation Fund',
    targetAmount: 5000,
    currentAmount: 2000,
    linkedAccountId: '1',
    userId: 'user1',
    categoryId: 'cat1',
    deadline: new Date('2025-12-31'),
    priority: 'medium' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockOnSubmit = vi.fn()

  it('should render current progress section', () => {
    render(<ContributeForm goal={mockGoal} onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.contribute.currentProgress/i)).toBeInTheDocument()
    expect(screen.getByText(/forms.contribute.currentAmount/i)).toBeInTheDocument()
    expect(screen.getByText(/forms.contribute.targetAmount/i)).toBeInTheDocument()
  })

  it('should render contribution amount field', () => {
    render(<ContributeForm goal={mockGoal} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.contribute.contributionAmount/i)).toBeInTheDocument()
  })

  it('should render date field', () => {
    render(<ContributeForm goal={mockGoal} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.contribute.date/i)).toBeInTheDocument()
  })

  it('should render account select', () => {
    render(<ContributeForm goal={mockGoal} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.contribute.account/i)).toBeInTheDocument()
  })

  it('should render notes textarea', () => {
    render(<ContributeForm goal={mockGoal} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.contribute.notesOptional/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<ContributeForm goal={mockGoal} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /forms.contribute.addContribution/i })).toBeInTheDocument()
  })
})
