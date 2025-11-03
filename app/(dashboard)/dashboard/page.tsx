'use client'

import { StatCard } from '@/components/StatCard'
import { ChartContainer } from '@/components/ChartContainer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  accounts,
  getRecentTransactions,
  getTotalBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
  budgets,
  bills,
} from '@/lib/mockData'
import { format } from 'date-fns'

export default function DashboardPage() {
  const totalBalance = getTotalBalance()
  const monthlyIncome = getMonthlyIncome()
  const monthlyExpenses = getMonthlyExpenses()
  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
  const recentTransactions = getRecentTransactions(8)

  // Generate daily spending data for the last 30 days
  const dailySpendingData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: format(date, 'MMM dd'),
      amount: Math.random() * 200 + 50,
    }
  })

  const upcomingBills = bills.filter(bill => !bill.isPaid).slice(0, 4)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's your financial summary
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+2.5% from last month"
          changeType="increase"
          icon={Wallet}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Monthly Income"
          value={`$${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+12.3% from last month"
          changeType="increase"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="-5.2% from last month"
          changeType="decrease"
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-100 dark:bg-red-900/30"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          change="+3.1% from last month"
          changeType="increase"
          icon={PiggyBank}
          iconColor="text-purple-600"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Charts and Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Chart */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Daily Spending Overview"
            description="Last 30 days spending trend"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Account Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {account.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {account.type}
                    </p>
                  </div>
                  <p className={`font-semibold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(transaction.date, 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget & Upcoming Bills */}
        <div className="space-y-6">
          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.slice(0, 4).map((budget) => (
                  <div key={budget.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        {budget.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ${budget.spent} / ${budget.limit}
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

          {/* Upcoming Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {bill.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due {format(bill.dueDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${bill.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
