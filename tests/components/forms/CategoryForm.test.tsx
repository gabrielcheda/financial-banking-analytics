import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryForm } from '@/components/forms/CategoryForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('CategoryForm', () => {
  const mockOnSubmit = vi.fn()

  it('should render category name field', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.category.categoryName/i)).toBeInTheDocument()
  })

  it('should render type selection (income/expense)', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.category.income/i)).toBeInTheDocument()
    expect(screen.getByText(/forms.category.expense/i)).toBeInTheDocument()
  })

  it('should render color picker section', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.category.color/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.category.hexColor/i)).toBeInTheDocument()
  })

  it('should render icon picker section', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.category.iconOptional/i)).toBeInTheDocument()
  })

  it('should render preview section', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/Preview/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /Save Category/i })).toBeInTheDocument()
  })
})
