import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MerchantForm } from '@/components/forms/MerchantForm'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: '1', name: 'Food', icon: '🍔' }],
  }),
}))

describe('MerchantForm', () => {
  const mockOnSubmit = vi.fn()

  it('should render basic information section', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/common.basicInformation/i)).toBeInTheDocument()
  })

  it('should render merchant name field', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.merchant.merchantName/i)).toBeInTheDocument()
  })

  it('should render phone field', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.merchant.phoneOptional/i)).toBeInTheDocument()
  })

  it('should render category select', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/forms.merchant.category/i)).toBeInTheDocument()
  })

  it('should render visual section', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/common.visual/i)).toBeInTheDocument()
  })

  it('should render location section', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/forms.merchant.locationOptional/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.merchant.address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forms.merchant.city/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<MerchantForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /forms.merchant.create/i })).toBeInTheDocument()
  })
})
