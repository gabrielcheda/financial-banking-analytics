import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountForm } from '@/components/forms/AccountForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useUser', () => ({
  usePreferences: () => ({
    data: { currency: 'USD' },
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AccountForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  it('should render form fields', () => {
    render(<AccountForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.account.accountName/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.account.accountType/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.account.currency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.account.initialBalance/i)).toBeInTheDocument()
  })

  it('should render account type options', () => {
    render(<AccountForm onSubmit={mockOnSubmit} />)

    const typeSelect = screen.getByLabelText(/forms.account.accountType/i)
    expect(typeSelect).toBeInTheDocument()
    expect(typeSelect.tagName).toBe('SELECT')
  })

  it('should render currency options', () => {
    render(<AccountForm onSubmit={mockOnSubmit} />)

    const currencySelect = screen.getByLabelText(/forms.account.currency/i)
    expect(currencySelect).toBeInTheDocument()
    expect(currencySelect.tagName).toBe('SELECT')
  })

  it('should render optional institution field', () => {
    render(<AccountForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.account.institution/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<AccountForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /accounts.saveAccount/i })).toBeInTheDocument()
  })

  it('should render cancel button when onCancel is provided', () => {
    render(<AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByRole('button', { name: /forms.account.cancel/i })).toBeInTheDocument()
  })
})
