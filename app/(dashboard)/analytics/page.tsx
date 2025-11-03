'use client'

import { ChartContainer } from '@/components/ChartContainer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { transactions, categories, getCategoryColor } from '@/lib/mockData'
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'

export default function AnalyticsPage() {
  // Calculate spending by category
  const categorySpending = categories.map((cat) => {
    const total = transactions
      .filter((t) => t.category === cat.name && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      name: cat.name,
      value: total,
      color: cat.color,
    }
  }).filter((cat) => cat.value > 0)
    .sort((a, b) => b.value - a.value)

  // Monthly spending trend (last 12 months)
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return (
        tDate.getMonth() === date.getMonth() &&
        tDate.getFullYear() === date.getFullYear()
      )
    })

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = Math.abs(
      monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    )

    return {
      month: monthName,
      income,
      expenses,
      net: income - expenses,
    }
  })

  // Top merchants
  const merchantSpending = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find((m) => m.merchant === t.merchant)
      if (existing) {
        existing.amount += Math.abs(t.amount)
        existing.count += 1
      } else {
        acc.push({
          merchant: t.merchant,
          amount: Math.abs(t.amount),
          count: 1,
        })
      }
      return acc
    }, [] as { merchant: string; amount: number; count: number }[])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  // Category comparison (this month vs last month)
  const now = new Date()
  const thisMonth = transactions.filter((t) => {
    const tDate = new Date(t.date)
    return (
      tDate.getMonth() === now.getMonth() &&
      tDate.getFullYear() === now.getFullYear() &&
      t.type === 'expense'
    )
  })

  const lastMonth = transactions.filter((t) => {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const tDate = new Date(t.date)
    return (
      tDate.getMonth() === lastMonthDate.getMonth() &&
      tDate.getFullYear() === lastMonthDate.getFullYear() &&
      t.type === 'expense'
    )
  })

  const categoryComparison = categories.map((cat) => {
    const thisMonthSpent = thisMonth
      .filter((t) => t.category === cat.name)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const lastMonthSpent = lastMonth
      .filter((t) => t.category === cat.name)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const change = lastMonthSpent > 0
      ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
      : 0

    return {
      category: cat.name,
      thisMonth: thisMonthSpent,
      lastMonth: lastMonthSpent,
      change,
    }
  }).filter((c) => c.thisMonth > 0 || c.lastMonth > 0)
    .sort((a, b) => b.thisMonth - a.thisMonth)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Detailed insights into your spending patterns
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category - Pie Chart */}
        <ChartContainer
          title="Spending by Category"
          description="Distribution of expenses across categories"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Category Comparison - Bar Chart */}
        <ChartContainer
          title="Monthly Category Comparison"
          description="This month vs last month spending"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryComparison.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="category"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="lastMonth" fill="#6366f1" name="Last Month" />
              <Bar dataKey="thisMonth" fill="#3b82f6" name="This Month" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Income vs Expenses - Area Chart */}
        <ChartContainer
          title="Income vs Expenses"
          description="Monthly comparison over the last 12 months"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Spending Trend - Line Chart */}
        <ChartContainer
          title="Net Income Trend"
          description="Monthly net income (income - expenses)"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {merchantSpending.map((merchant, index) => (
                <div
                  key={merchant.merchant}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {merchant.merchant}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {merchant.count} transactions
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${merchant.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown with Change */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryComparison.slice(0, 10).map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cat.category}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${cat.thisMonth.toFixed(2)} this month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.change > 0 ? (
                      <div className="flex items-center text-red-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">
                          +{cat.change.toFixed(1)}%
                        </span>
                      </div>
                    ) : cat.change < 0 ? (
                      <div className="flex items-center text-green-600">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">
                          {cat.change.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">0%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
