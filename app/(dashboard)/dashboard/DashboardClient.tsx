'use client'

import dynamic from 'next/dynamic'
import { StatCard } from '@/components/StatCard'
import { BalanceDisplay } from '@/components/BalanceDisplay'
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
import { format, subDays } from 'date-fns'
import { useAccountSummary, useAccounts } from '@/hooks/useAccounts'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useCurrentMonthBudgets } from '@/hooks/useBudgets'
import { useUpcomingBills } from '@/hooks/useBills'
import { useCurrentMonthOverview } from '@/hooks/useAnalytics'
import { useCashFlow } from '@/hooks/useAnalytics'
import { usePrefetch } from '@/hooks/usePrefetch'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n'

type CategoryValue = string | { id?: string; name?: string } | null | undefined

const getCategoryLabel = (category: CategoryValue, uncategorizedLabel: string): string => {
  if (!category) {
    return uncategorizedLabel
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

  return uncategorizedLabel
}

export default function DashboardClient() {
  const { t } = useI18n()
  const router = useRouter()
  const { prefetchTransactionsPage, prefetchTransactions } = usePrefetch()

  // Fetch real data from API
  const { data: accountSummary, isLoading: accountsLoading, isFetching: accountsFetching } = useAccountSummary()
  const { data: accountsResponse, isLoading: accountsListLoading, isFetching: accountsListFetching } = useAccounts()
  const accounts = accountsResponse || []
  const { data: recentTransactionsData, isLoading: transactionsLoading, isFetching: transactionsFetching } = useRecentTransactions()
  const { data: budgetsData, isLoading: budgetsLoading, isFetching: budgetsFetching } = useCurrentMonthBudgets()
  const { data: upcomingBillsData, isLoading: billsLoading, isFetching: billsFetching } = useUpcomingBills(7)
  const { data: monthlyOverview, isLoading: overviewLoading, isFetching: overviewFetching } = useCurrentMonthOverview()

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
    amount: Math.abs(Number(item.expenses ?? (item as any).amount ?? 0)),
  }))

  const recentTransactions = recentTransactionsData || []
  const budgets = budgetsData || []
  const upcomingBills = upcomingBillsData?.slice(0, 4) || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.overview')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accountsLoading || overviewLoading || accountsFetching || overviewFetching ? (
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
              title={t('dashboard.totalBalance')}
              value={<BalanceDisplay amount={totalBalance} />}
              change=""
              changeType="increase"
              icon={Wallet}
              iconColor="text-blue-600"
              iconBg="bg-blue-100 dark:bg-blue-900/30"
            />
            <StatCard
              title={t('dashboard.income')}
              value={<BalanceDisplay amount={monthlyIncome} />}
              change=""
              changeType="increase"
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBg="bg-green-100 dark:bg-green-900/30"
            />
            <StatCard
              title={t('dashboard.expenses')}
              value={<BalanceDisplay amount={monthlyExpenses} />}
              change=""
              changeType="increase"
              icon={TrendingDown}
              iconColor="text-red-600"
              iconBg="bg-red-100 dark:bg-red-900/30"
            />
            <StatCard
              title={t('dashboard.savings')}
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
            title={t('analytics.dailySpending')}
            description={t('analytics.trackDailyExpenses')}
          >
            {cashFlowLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : dailySpendingData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <EmptyState
                  icon={TrendingDown}
                  title={t('empty.noData')}
                  description={t('analytics.addTransactionsToSee')}
                />
              </div>
            ) : (
              <DynamicDailySpendingChart data={dailySpendingData} />
            )}
          </ChartContainer>
        </div>

        {/* Account Balances */}
        <Card>
          <CardHeader>
            <CardTitle>{t('accounts.accountBalances')}</CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading || accountsListLoading || accountsFetching || accountsListFetching ? (
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
                    onClick={() => router.push('/accounts')}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {account.type}
                      </p>
                    </div>
                    <BalanceDisplay 
                      amount={account.balance}
                      className={`font-semibold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title={t('empty.noAccounts')}
                description={t('accounts.createFirstAccount')}
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
            <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onMouseEnter={() => prefetchTransactionsPage()}
              onClick={() => router.push('/transactions')}
            >
              {t('dashboard.viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {transactionsLoading || transactionsFetching ? (
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
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => router.push('/transactions')}
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
                          {getCategoryLabel(transaction.categoryId as CategoryValue, t('categories.uncategorized'))}
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
                        {transaction.type === 'income' ? '+' : '-'}
                        <BalanceDisplay amount={Math.abs(Number(transaction.amount ?? 0))} showSign={false} />
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
                title={t('empty.noTransactions')}
                description={t('transactions.recentWillAppear')}
              />
            )}
          </CardContent>
        </Card>

        {/* Budget & Upcoming Bills */}
        <div className="space-y-6">
          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{t('budgets.budgetOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetsLoading || budgetsFetching ? (
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
                            {getCategoryLabel((budget.categoryName as CategoryValue) ?? budget.category, t('categories.uncategorized'))}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            <BalanceDisplay amount={spent} showSign={false} /> / <BalanceDisplay amount={limit} showSign={false} />
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
                  title={t('empty.noBudgets')}
                  description={t('budgets.createToTrack')}
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming Bills */}
          <Card>
            <CardHeader>
              <CardTitle>{t('bills.upcomingBills')}</CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading || billsFetching ? (
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
                            {t('bills.due')} {bill.dueDate ? format(new Date(bill.dueDate), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        <BalanceDisplay amount={Number(bill.amount) ?? 0} showSign={false} />
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title={t('bills.noUpcomingBills')}
                  description={t('bills.noBillsDueNext7Days')}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
const DynamicDailySpendingChart = dynamic(
  () => import('@/components/charts/DailySpendingChart').then((mod) => mod.DailySpendingChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full" />,
  }
)
