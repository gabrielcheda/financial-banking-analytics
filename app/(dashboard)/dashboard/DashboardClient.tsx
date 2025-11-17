'use client'

import { StatCard } from '@/components/StatCard'
import { ChartContainer } from '@/components/ChartContainer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
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
import { format, subDays } from 'date-fns'
import { useAccountSummary, useAccounts } from '@/hooks/useAccounts'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useCurrentMonthBudgets } from '@/hooks/useBudgets'
import { useUpcomingBills } from '@/hooks/useBills'
import { useCurrentMonthOverview } from '@/hooks/useAnalytics'
import { useCashFlow } from '@/hooks/useAnalytics'
import { usePrefetch } from '@/hooks/usePrefetch'
import { useRouter } from 'next/navigation'

type CategoryValue = string | { id?: string; name?: string } | null | undefined

const getCategoryLabel = (category: CategoryValue): string => {
  if (!category) {
    return 'Uncategorized'
  }

  if (typeof category === 'string') {
    return category
  }

  if (typeof category === 'object') {
    if (category.name && typeof category.name === 'string') {
      return category.name
    }

    if (category.id && typeof category.id === 'string') {
      return category.id
    }
  }

  return 'Uncategorized'
}

export default function DashboardClient() {
  const router = useRouter()
  const { prefetchTransactionsPage, prefetchTransactions } = usePrefetch()

  // Fetch real data from API
  const { data: accountSummary, isLoading: accountsLoading } = useAccountSummary()
  const { data: accountsResponse } = useAccounts()
  const accounts = accountsResponse || []
  const { data: recentTransactionsData, isLoading: transactionsLoading } = useRecentTransactions()
  const { data: budgetsData, isLoading: budgetsLoading } = useCurrentMonthBudgets()
  const { data: upcomingBillsData, isLoading: billsLoading } = useUpcomingBills(7)
  const { data: monthlyOverview, isLoading: overviewLoading } = useCurrentMonthOverview()

  // Cash flow for the last 30 days
  // const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
  // const endDate = format(new Date(), 'yyyy-MM-dd')
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const { data: cashFlowData, isLoading: cashFlowLoading } = useCashFlow({
    startDate,
    endDate,
    interval: 'daily'
  })

  // Calculate stats from data
  const totalBalance = Number(accountSummary?.totalBalance ?? 0)

  // Get monthly income and expenses from overview
  const monthlyIncome = Number(monthlyOverview?.income?.total ?? 0)
  const monthlyExpenses = Number(monthlyOverview?.expenses?.total ?? 0)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

  // Transform cash flow data for chart
  const dailySpendingData = (cashFlowData || []).map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    amount: Math.abs(Number(item.expenses ?? item.amount ?? 0)),
  }))

  const recentTransactions = recentTransactionsData || []
  const budgets = budgetsData || []
  const upcomingBills = upcomingBillsData?.slice(0, 4) || []

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
        {accountsLoading || overviewLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Balance"
              value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              change=""
              changeType="increase"
              icon={Wallet}
              iconColor="text-blue-600"
              iconBg="bg-blue-100 dark:bg-blue-900/30"
            />
            <StatCard
              title="Monthly Income"
              value={`$${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              change=""
              changeType="increase"
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBg="bg-green-100 dark:bg-green-900/30"
            />
            <StatCard
              title="Monthly Expenses"
              value={`$${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              change=""
              changeType="increase"
              icon={TrendingDown}
              iconColor="text-red-600"
              iconBg="bg-red-100 dark:bg-red-900/30"
            />
            <StatCard
              title="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              change=""
              changeType="increase"
              icon={PiggyBank}
              iconColor="text-purple-600"
              iconBg="bg-purple-100 dark:bg-purple-900/30"
            />
          </>
        )}
      </div>

      {/* Charts and Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Chart */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Daily Spending Overview"
            description="Last 30 days spending trend"
          >
            {cashFlowLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : dailySpendingData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <EmptyState
                  icon={TrendingDown}
                  title="No Spending Data"
                  description="Add transactions to see your spending trends"
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300} className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
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
            )}
          </ChartContainer>
        </div>

        {/* Account Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : accounts && accounts.length > 0 ? (
              <div className="space-y-4">
                {(accounts || []).map((account: any) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onMouseEnter={() => prefetchTransactions({ accountId: account.id, page: 1, limit: 20 })}
                  >
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
            ) : (
              <EmptyState
                icon={Wallet}
                title="No Accounts"
                description="Create your first account to get started"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onMouseEnter={() => prefetchTransactionsPage()}
              onClick={() => router.push('/transactions')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {(recentTransactions || []).slice(0, 8).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${transaction.type === 'income'
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
                          {getCategoryLabel(transaction.categoryId as CategoryValue)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-gray-900 dark:text-white'
                          }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {Math.abs(Number(transaction.amount ?? 0)).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.date), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingDown}
                title="No Transactions"
                description="Your recent transactions will appear here"
              />
            )}
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
              {budgetsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : budgets.length > 0 ? (
                <div className="space-y-4">
                {(budgets || []).slice(0, 4).map((budget: any) => {
                    const spent = Number(budget.spent ?? 0)
                    const limit = Number(budget.limit ?? budget.limitAmount ?? 0)
                    const percentage = limit > 0 ? (spent / limit) * 100 : 0
                    return (
                      <div key={budget.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">
                            {getCategoryLabel((budget.categoryName as CategoryValue) ?? budget.category)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            ${spent.toFixed(2)} / ${limit.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${percentage > 100
                              ? 'bg-red-500'
                              : percentage > 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No Budgets"
                  description="Create budgets to track your spending"
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingBills.length > 0 ? (
                <div className="space-y-3">
                  {(upcomingBills || []).map((bill) => (
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
                            Due {bill.dueDate ? format(new Date(bill.dueDate), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(Number(bill.amount) ?? 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No Upcoming Bills"
                  description="You have no bills due in the next 7 days"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
