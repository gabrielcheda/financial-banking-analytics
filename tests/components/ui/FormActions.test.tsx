/**
 * Tests for FormActions Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormActions } from '@/components/ui/FormActions'

describe('FormActions', () => {
  describe('Rendering', () => {
    it('should render submit button when onSubmit is provided', () => {
      render(<FormActions onSubmit={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('should render cancel button when onCancel is provided', () => {
      render(<FormActions onCancel={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should render both buttons when both handlers provided', () => {
      render(<FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should not render submit button when onSubmit is not provided', () => {
      render(<FormActions onCancel={vi.fn()} />)
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      render(<FormActions onSubmit={vi.fn()} />)
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    })

    it('should render custom submit label', () => {
      render(<FormActions onSubmit={vi.fn()} submitLabel="Create" />)
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    })

    it('should render custom cancel label', () => {
      render(<FormActions onCancel={vi.fn()} cancelLabel="Discard" />)
      expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument()
    })
  })

  describe('Button Types', () => {
    it('should have submit type for submit button', () => {
      render(<FormActions onSubmit={vi.fn()} />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should have button type for cancel button', () => {
      render(<FormActions onCancel={vi.fn()} />)
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Button Variants', () => {
    it('should render submit button with primary variant by default', () => {
      render(<FormActions onSubmit={vi.fn()} />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toHaveClass('bg-blue-600')
    })

    it('should render cancel button with outline variant', () => {
      render(<FormActions onCancel={vi.fn()} />)
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toHaveClass('border-gray-300')
    })

    it('should support danger variant for submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitVariant="danger" />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toHaveClass('bg-red-600')
    })

    it('should support secondary variant for submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitVariant="secondary" />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toHaveClass('bg-gray-200')
    })

    it('should support outline variant for submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitVariant="outline" />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toHaveClass('border-gray-300')
    })
  })

  describe('Loading State', () => {
    it('should show "Saving..." text when loading', () => {
      render(<FormActions onSubmit={vi.fn()} isLoading={true} />)
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })

    it('should disable submit button when loading', () => {
      render(<FormActions onSubmit={vi.fn()} isLoading={true} />)
      const submitButton = screen.getByRole('button', { name: 'Saving...' })
      expect(submitButton).toBeDisabled()
    })

    it('should disable cancel button when loading', () => {
      render(<FormActions onSubmit={vi.fn()} onCancel={vi.fn()} isLoading={true} />)
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toBeDisabled()
    })

    it('should show custom label when not loading', () => {
      render(<FormActions onSubmit={vi.fn()} submitLabel="Submit" isLoading={false} />)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should disable submit button when isDisabled is true', () => {
      render(<FormActions onSubmit={vi.fn()} isDisabled={true} />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toBeDisabled()
    })

    it('should not disable cancel button when isDisabled is true', () => {
      render(<FormActions onSubmit={vi.fn()} onCancel={vi.fn()} isDisabled={true} />)
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).not.toBeDisabled()
    })

    it('should disable submit button when both isDisabled and isLoading', () => {
      render(<FormActions onSubmit={vi.fn()} isDisabled={true} isLoading={true} />)
      const submitButton = screen.getByRole('button', { name: 'Saving...' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('should call onSubmit when submit button clicked', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      render(<FormActions onSubmit={handleSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: 'Save' })
      await user.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const handleCancel = vi.fn()
      render(<FormActions onCancel={handleCancel} />)
      
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)
      
      expect(handleCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onSubmit when disabled', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      render(<FormActions onSubmit={handleSubmit} isDisabled={true} />)
      
      const submitButton = screen.getByRole('button', { name: 'Save' })
      await user.click(submitButton)
      
      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('should not call handlers when loading', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      const handleCancel = vi.fn()
      render(<FormActions onSubmit={handleSubmit} onCancel={handleCancel} isLoading={true} />)
      
      const submitButton = screen.getByRole('button', { name: 'Saving...' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      
      await user.click(submitButton)
      await user.click(cancelButton)
      
      expect(handleSubmit).not.toHaveBeenCalled()
      expect(handleCancel).not.toHaveBeenCalled()
    })
  })

  describe('Layout Alignment', () => {
    it('should align right by default', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('justify-end')
    })

    it('should align left when alignment is left', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} alignment="left" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('justify-start')
    })

    it('should align center when alignment is center', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} alignment="center" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('justify-center')
    })

    it('should align between when alignment is between', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} alignment="between" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('justify-between')
    })

    it('should have gap between buttons', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('gap-3')
    })
  })

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} />)
      const wrapper = container.firstChild
      expect(wrapper).not.toHaveClass('flex-col')
    })

    it('should use flex-col on mobile when fullWidth is true', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} fullWidth={true} />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('flex-col', 'sm:flex-row')
    })

    it('should make buttons full width on mobile', () => {
      render(<FormActions onSubmit={vi.fn()} onCancel={vi.fn()} fullWidth={true} />)
      const submitButton = screen.getByRole('button', { name: 'Save' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      
      expect(submitButton).toHaveClass('w-full', 'sm:w-auto')
      expect(cancelButton).toHaveClass('w-full', 'sm:w-auto')
    })
  })

  describe('Button Order', () => {
    it('should render cancel button before submit button', () => {
      render(<FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveTextContent('Cancel')
      expect(buttons[1]).toHaveTextContent('Save')
    })
  })
})
