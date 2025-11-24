'use client'

import { memo } from 'react'
import { useBalanceFormatter } from '@/hooks/useBalanceFormatter'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type DailySpendingData = {
  date: string
  amount: number
}

interface DailySpendingChartProps {
  data: DailySpendingData[]
}

function DailySpendingChartComponent({ data }: DailySpendingChartProps) {
  const { formatBalance } = useBalanceFormatter()
  
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#9ca3af" />
        <YAxis
          stroke="#9ca3af"
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            borderRadius: '0.5rem',
            border: 'none',
            color: '#f9fafb',
          }}
          formatter={(value: number) => [formatBalance(value), 'Spending']}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const DailySpendingChart = memo(DailySpendingChartComponent)

export default DailySpendingChart
