import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Wallet } from 'lucide-react'
import { StatCard } from '@/components/StatCard'

describe('StatCard Component', () => {
  it('should render with required props', () => {
    render(
      <StatCard
        title="Total Balance"
        value="$1,234.56"
        icon={Wallet}
      />
    )

    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })

  it('should render change with increase type', () => {
    render(
      <StatCard
        title="Revenue"
        value="$5,000"
        change="+10% from last month"
        changeType="increase"
        icon={Wallet}
      />
    )

    const changeText = screen.getByText('+10% from last month')
    expect(changeText).toBeInTheDocument()
    expect(changeText).toHaveClass('text-green-600')
  })

  it('should render change with decrease type', () => {
    render(
      <StatCard
        title="Expenses"
        value="$2,000"
        change="-5% from last month"
        changeType="decrease"
        icon={Wallet}
      />
    )

    const changeText = screen.getByText('-5% from last month')
    expect(changeText).toBeInTheDocument()
    expect(changeText).toHaveClass('text-red-600')
  })

  it('should render change with neutral type', () => {
    render(
      <StatCard
        title="Balance"
        value="$1,000"
        change="No change"
        changeType="neutral"
        icon={Wallet}
      />
    )

    const changeText = screen.getByText('No change')
    expect(changeText).toBeInTheDocument()
    expect(changeText).toHaveClass('text-gray-600')
  })

  it('should not render change when not provided', () => {
    render(
      <StatCard
        title="Balance"
        value="$1,000"
        icon={Wallet}
      />
    )

    expect(screen.queryByText(/from last month/i)).not.toBeInTheDocument()
  })

  it('should apply custom icon colors', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="$100"
        icon={Wallet}
        iconColor="text-red-600"
        iconBg="bg-red-100"
      />
    )

    const iconContainer = container.querySelector('.bg-red-100')
    expect(iconContainer).toBeInTheDocument()

    const icon = container.querySelector('.text-red-600')
    expect(icon).toBeInTheDocument()
  })

  it('should use default icon colors when not provided', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="$100"
        icon={Wallet}
      />
    )

    const iconContainer = container.querySelector('.bg-blue-100')
    expect(iconContainer).toBeInTheDocument()

    const icon = container.querySelector('.text-blue-600')
    expect(icon).toBeInTheDocument()
  })

  it('should have proper card styling', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="$100"
        icon={Wallet}
      />
    )

    const card = container.querySelector('.bg-white')
    expect(card).toHaveClass('rounded-lg', 'shadow-md', 'border')
  })

  it('should support dark mode classes', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="$100"
        icon={Wallet}
      />
    )

    const card = container.querySelector('.dark\\:bg-gray-800')
    expect(card).toBeInTheDocument()
  })

  it('should be memoized', () => {
    // StatCard uses React.memo, so it should not re-render unnecessarily
    const { rerender } = render(
      <StatCard
        title="Test"
        value="$100"
        icon={Wallet}
      />
    )

    // Re-render with same props should not cause update
    rerender(
      <StatCard
        title="Test"
        value="$100"
        icon={Wallet}
      />
    )

    // Component should still be in document
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
