import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileQuestion } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

describe('EmptyState Component', () => {
  it('should render with required props', () => {
    render(
      <EmptyState
        icon={FileQuestion}
        title="No data found"
        description="There is no data to display"
      />
    )

    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.getByText('There is no data to display')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const handleClick = vi.fn()

    render(
      <EmptyState
        icon={FileQuestion}
        title="No data"
        description="Add some data"
        action={{
          label: 'Add Data',
          onClick: handleClick,
        }}
      />
    )

    const button = screen.getByRole('button', { name: /add data/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        icon={FileQuestion}
        title="No data"
        description="No action available"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should render with default variant', () => {
    const { container } = render(
      <EmptyState
        icon={FileQuestion}
        title="Test"
        description="Test description"
      />
    )

    const iconContainer = container.querySelector('.bg-gray-100')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should render with search variant', () => {
    const { container } = render(
      <EmptyState
        icon={FileQuestion}
        title="No results"
        description="Try a different search"
        variant="search"
      />
    )

    const iconContainer = container.querySelector('.bg-blue-100')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should render with filter variant', () => {
    const { container } = render(
      <EmptyState
        icon={FileQuestion}
        title="No matches"
        description="Try different filters"
        variant="filter"
      />
    )

    const iconContainer = container.querySelector('.bg-purple-100')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should render with error variant', () => {
    const { container } = render(
      <EmptyState
        icon={FileQuestion}
        title="Error"
        description="Something went wrong"
        variant="error"
      />
    )

    const iconContainer = container.querySelector('.bg-red-100')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <EmptyState
        icon={FileQuestion}
        title="No data"
        description="Description"
      />
    )

    const container = screen.getByRole('status')
    expect(container).toHaveAttribute('aria-live', 'polite')
  })

  it('should render icon with aria-hidden', () => {
    const { container } = render(
      <EmptyState
        icon={FileQuestion}
        title="Test"
        description="Test"
      />
    )

    const icon = container.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
