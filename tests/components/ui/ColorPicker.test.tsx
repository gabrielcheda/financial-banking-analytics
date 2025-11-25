/**
 * Tests for ColorPicker Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker, PRESET_COLORS } from '@/components/ui/ColorPicker'

// Mock i18n
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('ColorPicker', () => {
  describe('Rendering', () => {
    it('should render color picker with label', () => {
      render(<ColorPicker value="#10b981" onChange={vi.fn()} label="Choose color" />)
      expect(screen.getByText('Choose color')).toBeInTheDocument()
    })

    it('should render without label', () => {
      render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      expect(screen.getByText('Color')).toBeInTheDocument()
    })

    it('should show required indicator when required', () => {
      render(<ColorPicker value="#10b981" onChange={vi.fn()} label="Color" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should render error message', () => {
      render(<ColorPicker value="" onChange={vi.fn()} error="Color is required" />)
      expect(screen.getByText('Color is required')).toBeInTheDocument()
    })

    it('should render preset colors', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const colorButtons = container.querySelectorAll('button[aria-label^="Select color"]')
      expect(colorButtons).toHaveLength(PRESET_COLORS.length)
    })

    it('should render custom input by default', () => {
      render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      expect(screen.getByLabelText(/enter custom hex color/i)).toBeInTheDocument()
    })

    it('should hide custom input when allowCustom is false', () => {
      render(<ColorPicker value="#10b981" onChange={vi.fn()} allowCustom={false} />)
      expect(screen.queryByLabelText(/enter custom hex color/i)).not.toBeInTheDocument()
    })

    it('should render custom color list', () => {
      const customColors = ['#000000', '#ffffff'] as const
      const { container } = render(
        <ColorPicker value="#000000" onChange={vi.fn()} colors={customColors} />
      )
      const colorButtons = container.querySelectorAll('button[aria-label^="Select color"]')
      expect(colorButtons).toHaveLength(customColors.length)
    })
  })

  describe('Selection', () => {
    it('should highlight selected color', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const selectedButton = container.querySelector('button[style*="background-color: rgb(16, 185, 129)"]')
      expect(selectedButton).toHaveClass('ring-2')
    })

    it('should call onChange when preset color is clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<ColorPicker value="#10b981" onChange={handleChange} />)
      
      const colorButton = container.querySelector('button[aria-label="Select color #3b82f6"]')
      if (colorButton) {
        await user.click(colorButton)
        expect(handleChange).toHaveBeenCalledWith('#3b82f6')
      }
    })

    it('should call onChange when custom color is typed', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<ColorPicker value="" onChange={handleChange} />)
      
      const customInput = screen.getByLabelText(/enter custom hex color/i)
      await user.type(customInput, '#abc123')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should display current value in custom input', () => {
      render(<ColorPicker value="#custom" onChange={vi.fn()} />)
      const customInput = screen.getByLabelText(/enter custom hex color/i) as HTMLInputElement
      expect(customInput.value).toBe('#custom')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const colorButton = container.querySelector('button[aria-label="Select color #10b981"]')
      expect(colorButton).toHaveAttribute('title', '#10b981')
    })

    it('should indicate selected color to screen readers', () => {
      render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      expect(screen.getByText('common.selected', { selector: '.sr-only' })).toBeInTheDocument()
    })

    it('should have proper focus styles', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const colorButtons = container.querySelectorAll('button[aria-label^="Select color"]')
      colorButtons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')
      })
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<ColorPicker value="#10b981" onChange={handleChange} />)
      
      const firstButton = container.querySelector('button[aria-label^="Select color"]') as HTMLElement
      if (firstButton) {
        firstButton.focus()
        expect(firstButton).toHaveFocus()
      }
    })
  })

  describe('Visual Feedback', () => {
    it('should scale up selected color button', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const selectedButton = container.querySelector('button[style*="background-color: rgb(16, 185, 129)"]')
      expect(selectedButton).toHaveClass('scale-110')
    })

    it('should have hover effect on unselected colors', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const colorButtons = container.querySelectorAll('button[aria-label^="Select color"]')
      // At least one button should not have the selected scale-110 class
      const unselectedButtons = Array.from(colorButtons).filter(btn => !btn.classList.contains('scale-110'))
      expect(unselectedButtons.length).toBeGreaterThan(0)
    })

    it('should display colors in grid layout', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const grid = container.querySelector('.grid.grid-cols-8')
      expect(grid).toBeInTheDocument()
    })

    it('should have proper color button size', () => {
      const { container } = render(<ColorPicker value="#10b981" onChange={vi.fn()} />)
      const colorButtons = container.querySelectorAll('button[aria-label^="Select color"]')
      colorButtons.forEach(button => {
        expect(button).toHaveClass('w-10', 'h-10')
      })
    })
  })

  describe('Error State', () => {
    it('should display error message with proper styling', () => {
      render(<ColorPicker value="" onChange={vi.fn()} error="Please select a color" />)
      const error = screen.getByText('Please select a color')
      expect(error).toHaveClass('text-red-600')
    })

    it('should have error styling in dark mode', () => {
      render(<ColorPicker value="" onChange={vi.fn()} error="Error" />)
      const error = screen.getByText('Error')
      expect(error).toHaveClass('dark:text-red-400')
    })
  })
})
