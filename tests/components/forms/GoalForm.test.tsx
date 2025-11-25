import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalForm } from '@/components/forms/GoalForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: '1', name: 'Savings' }],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useAccounts', () => ({
  useActiveAccounts: () => ({
    data: [{ id: '1', name: 'Savings Account', type: 'savings' }],
    isLoading: false,
  }),
}))

describe('GoalForm', () => {
  const mockOnSubmit = vi.fn()

  it('should render goal name field', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.goal.goalName/i)).toBeInTheDocument()
  })

  it('should render description textarea', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.goal.description/i)).toBeInTheDocument()
  })

  it('should render target and current amount fields', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.goal.targetAmount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.goal.currentAmount/i)).toBeInTheDocument()
  })

  it('should render deadline and priority fields', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.goal.deadline/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.goal.priority/i)).toBeInTheDocument()
  })

  it('should render category and linked account selects', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.goal.category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.goal.linkedAccountOptional/i)).toBeInTheDocument()
  })

  it('should render monthly contribution field', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.goal.monthlyContribution/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<GoalForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /forms.goal.create/i })).toBeInTheDocument()
  })
})
