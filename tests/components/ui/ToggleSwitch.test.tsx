/**
 * Tests for ToggleSwitch Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'

describe('ToggleSwitch', () => {
  describe('Rendering', () => {
    it('should render toggle switch', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} label="Enable notifications" />)
      // Label appears twice: once in sr-only span, once visible
      const labels = screen.getAllByText('Enable notifications')
      expect(labels.length).toBe(2)
    })

    it('should render with description', () => {
      render(
        <ToggleSwitch 
          checked={false} 
          onChange={vi.fn()} 
          label="Feature"
          description="Enable this feature"
        />
      )
      expect(screen.getByText('Enable this feature')).toBeInTheDocument()
    })

    it('should render without label and description', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      expect(screen.queryByText('Enable notifications')).not.toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be unchecked by default', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should be checked when checked prop is true', () => {
      render(<ToggleSwitch checked={true} onChange={vi.fn()} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('should apply checked styles when checked', () => {
      const { container } = render(<ToggleSwitch checked={true} onChange={vi.fn()} />)
      const toggle = container.querySelector('.bg-blue-600')
      expect(toggle).toBeInTheDocument()
    })

    it('should apply unchecked styles when unchecked', () => {
      const { container } = render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      const toggle = container.querySelector('.bg-gray-200')
      expect(toggle).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} disabled={true} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} disabled={true} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('opacity-50', 'cursor-not-allowed')
    })
  })

  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      const { container } = render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      const toggle = container.querySelector('.w-11.h-6')
      expect(toggle).toBeInTheDocument()
    })

    it('should render with small size', () => {
      const { container } = render(<ToggleSwitch checked={false} onChange={vi.fn()} size="sm" />)
      const toggle = container.querySelector('.w-9.h-5')
      expect(toggle).toBeInTheDocument()
    })

    it('should render with large size', () => {
      const { container } = render(<ToggleSwitch checked={false} onChange={vi.fn()} size="lg" />)
      const toggle = container.querySelector('.w-14.h-7')
      expect(toggle).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onChange with true when clicked while unchecked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<ToggleSwitch checked={false} onChange={handleChange} />)
      
      await user.click(screen.getByRole('switch'))
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('should call onChange with false when clicked while checked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<ToggleSwitch checked={true} onChange={handleChange} />)
      
      await user.click(screen.getByRole('switch'))
      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<ToggleSwitch checked={false} onChange={handleChange} disabled={true} />)
      
      await user.click(screen.getByRole('switch'))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<ToggleSwitch checked={false} onChange={handleChange} label="Toggle" />)
      
      const toggle = screen.getByRole('switch')
      toggle.focus()
      expect(toggle).toHaveFocus()
    })

    it('should toggle via keyboard', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<ToggleSwitch checked={false} onChange={handleChange} />)
      
      const toggle = screen.getByRole('switch')
      toggle.focus()
      await user.keyboard(' ')
      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('should have aria-checked attribute', () => {
      render(<ToggleSwitch checked={true} onChange={vi.fn()} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('should have screen reader text', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} label="Notifications" />)
      expect(screen.getByText('Notifications', { selector: '.sr-only' })).toBeInTheDocument()
    })

    it('should have default screen reader text when no label', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      expect(screen.getByText('Toggle', { selector: '.sr-only' })).toBeInTheDocument()
    })

    it('should have focus styles', () => {
      render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')
    })
  })

  describe('Layout', () => {
    it('should display label and switch in flex layout', () => {
      const { container } = render(
        <ToggleSwitch 
          checked={false} 
          onChange={vi.fn()} 
          label="Feature"
        />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('flex', 'items-start', 'gap-3')
    })

    it('should show both label and description', () => {
      render(
        <ToggleSwitch
          checked={false}
          onChange={vi.fn()}
          label="Dark Mode"
          description="Toggle dark mode theme"
        />
      )
      // Label appears twice (sr-only + visible)
      const labels = screen.getAllByText('Dark Mode')
      expect(labels.length).toBe(2)
      expect(screen.getByText('Toggle dark mode theme')).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('should translate toggle button when checked', () => {
      const { container } = render(<ToggleSwitch checked={true} onChange={vi.fn()} />)
      const toggleButton = container.querySelector('.translate-x-5')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should not translate toggle button when unchecked', () => {
      const { container } = render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      const toggleButton = container.querySelector('.translate-x-0')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should have transition classes', () => {
      const { container } = render(<ToggleSwitch checked={false} onChange={vi.fn()} />)
      const toggleButton = container.querySelector('.transition')
      expect(toggleButton).toBeInTheDocument()
    })
  })
})
