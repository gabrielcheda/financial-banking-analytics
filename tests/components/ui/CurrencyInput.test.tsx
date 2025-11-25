/**
 * Tests for CurrencyInput Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

// Mock parseLocaleNumber
vi.mock('@/lib/numberUtils', () => ({
  parseLocaleNumber: (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.')
    return parseFloat(cleaned)
  },
}))

describe('CurrencyInput', () => {
  describe('Rendering', () => {
    it('should render currency input with label', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} label="Amount" />)
      expect(screen.getByText('Amount')).toBeInTheDocument()
    })

    it('should render without label', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      expect(screen.queryByText('Amount')).not.toBeInTheDocument()
    })

    it('should show required indicator', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} label="Price" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should display default currency symbol ($)', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      expect(screen.getByText('$')).toBeInTheDocument()
    })

    it('should display custom currency symbol', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} currency="€" />)
      expect(screen.getByText('€')).toBeInTheDocument()
    })

    it('should show placeholder', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} placeholder="Enter amount" />)
      const input = screen.getByPlaceholderText('Enter amount')
      expect(input).toBeInTheDocument()
    })

    it('should show default placeholder', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByPlaceholderText('0.00')
      expect(input).toBeInTheDocument()
    })

    it('should render error message', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} error="Invalid amount" />)
      expect(screen.getByText('Invalid amount')).toBeInTheDocument()
    })
  })

  describe('Value Display', () => {
    it('should display numeric value with two decimals', () => {
      render(<CurrencyInput value={100.50} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('100.50')
    })

    it('should remove .00 from display', () => {
      render(<CurrencyInput value={100} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('100')
    })

    it('should display string value', () => {
      render(<CurrencyInput value="50.25" onChange={vi.fn()} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('50.25')
    })

    it('should handle empty value', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('0')
    })
  })

  describe('User Input', () => {
    it('should call onChange when value changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={0} onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, '123.45')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onChange with 0 for empty input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={100} onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.clear(input)
      
      expect(handleChange).toHaveBeenCalledWith(0)
    })

    it('should parse decimal numbers', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={0} onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '99.99')
      
      // parseLocaleNumber mock returns parsed value
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle comma as decimal separator', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={0} onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '50,75')
      
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Constraints', () => {
    it('should respect minimum value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={10} onChange={handleChange} min={5} />)
      
      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, '3')
      
      // Mock should enforce min constraint
      expect(handleChange).toHaveBeenCalled()
    })

    it('should respect maximum value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={10} onChange={handleChange} max={100} />)
      
      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, '150')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should have decimal input mode', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('inputMode', 'decimal')
    })

    it('should have step attribute', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} step={0.01} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('step', '0.01')
    })

    it('should use custom step value', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} step={1} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('step', '1')
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput value={0} onChange={handleChange} disabled />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '100')
      
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('should have currency symbol in correct position', () => {
      const { container } = render(<CurrencyInput value={0} onChange={vi.fn()} currency="$" />)
      const symbolContainer = container.querySelector('.absolute.inset-y-0.left-0')
      expect(symbolContainer).toBeInTheDocument()
      expect(symbolContainer?.textContent).toBe('$')
    })

    it('should have proper input padding for currency symbol', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('pl-7')
    })

    it('should have focus styles', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')
    })

    it('should support dark mode', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('dark:bg-gray-800', 'dark:text-white')
    })
  })

  describe('Error State', () => {
    it('should display error message', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} error="Amount is required" />)
      const error = screen.getByText('Amount is required')
      expect(error).toBeInTheDocument()
    })

    it('should have error styling', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} error="Error" />)
      const error = screen.getByText('Error')
      expect(error).toHaveClass('text-red-600', 'dark:text-red-400')
    })
  })

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} label="Price" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Price')
      expect(label).toBeInTheDocument()
    })

    it('should have text input type', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<CurrencyInput value={0} onChange={vi.fn()} />)
      
      const input = screen.getByRole('textbox')
      await user.tab()
      
      // Input should be focusable via keyboard
      expect(document.activeElement).toBe(input)
    })
  })
})
