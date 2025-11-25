import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { DailySpendingChart } from '@/components/charts/DailySpendingChart'

// Mock dependencies
vi.mock('@/hooks/useBalanceFormatter', () => ({
  useBalanceFormatter: () => ({
    formatBalance: (amount: number) => `$${amount.toFixed(2)}`,
  }),
}))

// Mock recharts to avoid canvas/SVG rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-length={data.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

describe('DailySpendingChart', () => {
  const mockData = [
    { date: '2024-01-01', amount: 100 },
    { date: '2024-01-02', amount: 150 },
    { date: '2024-01-03', amount: 200 },
  ]

  it('should render ResponsiveContainer', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    expect(getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('should render LineChart with data', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    const lineChart = getByTestId('line-chart')
    expect(lineChart).toBeInTheDocument()
    expect(lineChart.dataset.length).toBe('3')
  })

  it('should render Line component with correct dataKey', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    const line = getByTestId('line')
    expect(line).toBeInTheDocument()
    expect(line.dataset.key).toBe('amount')
  })

  it('should render Line with blue stroke color', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    const line = getByTestId('line')
    expect(line.dataset.stroke).toBe('#2563eb')
  })

  it('should render XAxis with date dataKey', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    const xAxis = getByTestId('x-axis')
    expect(xAxis).toBeInTheDocument()
    expect(xAxis.dataset.key).toBe('date')
  })

  it('should render YAxis', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    expect(getByTestId('y-axis')).toBeInTheDocument()
  })

  it('should render CartesianGrid', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    expect(getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  it('should render Tooltip', () => {
    const { getByTestId } = render(<DailySpendingChart data={mockData} />)

    expect(getByTestId('tooltip')).toBeInTheDocument()
  })

  it('should handle empty data array', () => {
    const { getByTestId } = render(<DailySpendingChart data={[]} />)

    const lineChart = getByTestId('line-chart')
    expect(lineChart.dataset.length).toBe('0')
  })
})
