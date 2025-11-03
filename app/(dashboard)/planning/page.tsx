'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChartContainer } from '@/components/ChartContainer'
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Calculator,
  DollarSign,
} from 'lucide-react'
import { financialGoals, budgets, bills } from '@/lib/mockData'
import { format, differenceInDays } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function PlanningPage() {
  const [savingsGoal, setSavingsGoal] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [currentSavings, setCurrentSavings] = useState(2000)
  const [interestRate, setInterestRate] = useState(5)

  // Calculate savings projection
  const calculateProjection = () => {
    const months = 24
    const monthlyRate = interestRate / 100 / 12
    const projection = []

    let balance = currentSavings

    for (let i = 0; i <= months; i++) {
      projection.push({
        month: i,
        balance: Math.round(balance * 100) / 100,
      })

      if (i < months) {
        balance = balance * (1 + monthlyRate) + monthlyContribution
      }
    }

    return projection
  }

  const projectionData = calculateProjection()
  const monthsToGoal = projectionData.findIndex((p) => p.balance >= savingsGoal)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Financial Planning
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Set goals, create budgets, and plan for the future
        </p>
      </div>

      {/* Financial Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Financial Goals
          </h2>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const daysLeft = differenceInDays(goal.deadline, new Date())
            const monthsLeft = Math.ceil(daysLeft / 30)

            return (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {goal.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        goal.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : goal.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {goal.priority}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Current
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${goal.currentAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Target
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {monthsLeft} months until {format(goal.deadline, 'MMM yyyy')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Savings Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <CardTitle>Savings Projection Calculator</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Savings Goal ($)
              </label>
              <input
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Savings ($)
              </label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interest Rate (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Projected Balance (24 months)
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${projectionData[projectionData.length - 1].balance.toLocaleString()}
                </span>
              </div>
              {monthsToGoal > 0 && monthsToGoal <= 24 && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Target className="w-4 h-4" />
                  <span>Goal reached in {monthsToGoal} months</span>
                </div>
              )}
              {monthsToGoal > 24 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Goal will take more than 24 months at this rate
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <ChartContainer
          title="Savings Growth Projection"
          description="24-month savings projection with compound interest"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Budget</CardTitle>
            <Button variant="outline" size="sm">
              Edit Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgets.map((budget) => (
              <div
                key={budget.category}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {budget.category}
                </h4>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    ${budget.spent} / ${budget.limit}
                  </span>
                  <span
                    className={`font-semibold ${
                      budget.percentage > 100
                        ? 'text-red-600'
                        : budget.percentage > 80
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      budget.percentage > 100
                        ? 'bg-red-500'
                        : budget.percentage > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bill Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Bills</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`p-4 rounded-lg border-2 ${
                  bill.isPaid
                    ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {bill.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bill.category}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bill.isPaid
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {bill.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due {format(bill.dueDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
                    <DollarSign className="w-4 h-4" />
                    {bill.amount.toFixed(2)}
                  </div>
                </div>

                {bill.isRecurring && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Recurring monthly
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
