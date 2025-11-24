'use client'

import { useState, useMemo } from 'react'
import { useI18n } from '@/i18n'
import { ChartContainer } from '@/components/ChartContainer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { useBalanceFormatter } from '@/hooks/useBalanceFormatter'
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
import { TrendingUp, TrendingDown, ArrowUpDown, Calendar, BarChart3 } from 'lucide-react'
import {
  useSpendingByCategory,
  useSpendingTrends,
  useCashFlow,
  useAnalyticsOverview
} from '@/hooks/useAnalytics'
import { useTransactions } from '@/hooks/useTransactions'
import { format, subMonths } from 'date-fns'

export default function AnalyticsClient() {
  const { t } = useI18n()
  const { formatBalance } = useBalanceFormatter()
  
  // Date range state - default to last 12 months
  const [startDate, setStartDate] = useState(
    format(subMonths(new Date(), 11), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )

  // Fetch analytics data with date filters
  const { data: spendingData, isLoading: isLoadingSpending } = useSpendingByCategory({
    startDate,
    endDate,
  })

  const { data: trendsData, isLoading: isLoadingTrends } = useSpendingTrends({
    startDate,
    endDate,
  })

  const { data: cashFlowData, isLoading: isLoadingCashFlow } = useCashFlow({
    startDate,
    endDate,
    interval: 'monthly',
  })

  const { data: overview, isLoading: isLoadingOverview } = useAnalyticsOverview({
    startDate,
    endDate,
  })

  // Fetch transactions for top merchants calculation
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useTransactions({
    dateFrom: startDate,
    dateTo: endDate,
    type: 'expense',
    limit: 1000, // Get all transactions for merchant calculation
  })

  // Calculate top merchants from transactions
  const merchantSpending = useMemo(() => {
    if (!transactionsResponse?.data) return []

    const merchantMap = transactionsResponse.data.reduce((acc, t) => {
      const merchant = t.merchant || 'Unknown'
      if (!acc[merchant]) {
        acc[merchant] = { merchant, amount: 0, count: 0 }
      }
      acc[merchant].amount += Math.abs(t.amount)
      acc[merchant].count += 1
      return acc
    }, {} as Record<string, { merchant: string; amount: number; count: number }>)

    return Object.values(merchantMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }, [transactionsResponse])

  // Transform spending data for pie chart
  const categorySpending = useMemo(() => {
    if (!spendingData || !Array.isArray(spendingData)) return []
    return spendingData
      .filter((cat) => cat.amount > 0)
      .map((cat) => ({
        name: cat.category,
        value: cat.amount,
        color: '#8884d8',
      }))
      .sort((a, b) => b.value - a.value)
  }, [spendingData])

  // Transform cash flow data for charts
  const monthlyTrend = useMemo(() => {
    if (!cashFlowData) return []
    return cashFlowData.map((item) => ({
      month: format(new Date(item.date), 'MMM'),
      income: item.income,
      expenses: Math.abs(item.expenses),
      net: item.net,
    }))
  }, [cashFlowData])

  // Category comparison (this month vs last month)
  const categoryComparison = useMemo((): Array<{
    category: string
    thisMonth: number
    lastMonth: number
    change: number
  }> => {
    if (!spendingData || !Array.isArray(spendingData)) return []

    // Use trend data from spending data to calculate comparison
    return spendingData
      .filter((cat) => cat.trend)
      .map((cat) => ({
        category: cat.category,
        thisMonth: cat.amount || 0,
        lastMonth: cat.trend?.previousPeriod || 0,
        change: cat.trend?.percentage || 0,
      }))
      .filter((c) => c.thisMonth > 0 || c.lastMonth > 0)
      .sort((a, b) => b.thisMonth - a.thisMonth)
  }, [spendingData])

  const isLoading = isLoadingSpending || isLoadingTrends || isLoadingCashFlow || isLoadingOverview || isLoadingTransactions

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  )

  // Check if we have ANY data at all
  const hasAnyData = categorySpending.length > 0 || monthlyTrend.length > 0 || merchantSpending.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('analytics.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('analytics.description')}
        </p>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('analytics.dateRange')}
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">{t('analytics.to')}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !hasAnyData ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={BarChart3}
              title={t('analytics.noDataToAnalyze')}
              description={t('analytics.startAddingTransactions')}
              variant="default"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending by Category - Pie Chart */}
            <ChartContainer
              title={t('analytics.spendingByCategory')}
              description={t('analytics.distributionAcrossCategories')}
            >
              {categorySpending.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">{t('analytics.noCategoryData')}</p>
                </div>
              ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    //@ts-ignore
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(categorySpending || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatBalance(value)}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Category Comparison - Bar Chart */}
        <ChartContainer
          title={t('analytics.monthlyCategoryComparison')}
          description={t('analytics.thisVsLastMonth')}
        >
          {categoryComparison.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">{t('analytics.noComparisonData')}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
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
                  formatter={(value: number) => formatBalance(value)}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="lastMonth" fill="#6366f1" name={t('analytics.lastMonth')} />
                <Bar dataKey="thisMonth" fill="#3b82f6" name={t('analytics.thisMonth')} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Income vs Expenses - Area Chart */}
        <ChartContainer
          title={t('analytics.incomeVsExpenses')}
          description={t('analytics.monthlyComparison')}
        >
          {monthlyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">{t('analytics.noCashFlowData')}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
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
                  formatter={(value: number) => formatBalance(value)}
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
          )}
        </ChartContainer>

        {/* Monthly Spending Trend - Line Chart */}
        <ChartContainer
          title={t('analytics.netIncomeTrend')}
          description={t('analytics.monthlyNetIncome')}
        >
          {monthlyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">{t('analytics.noTrendData')}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
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
                  formatter={(value: number) => formatBalance(value)}
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
          )}
        </ChartContainer>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.topMerchants')}</CardTitle>
          </CardHeader>
          <CardContent>
            {merchantSpending.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('analytics.noMerchantData')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(merchantSpending || []).map((merchant, index) => (
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
                          {merchant.count} {t('analytics.transactions')}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      $<BalanceDisplay amount={merchant.amount ?? 0} showSign={false} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown with Change */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.categoryBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryComparison.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('analytics.noCategoryData')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(categoryComparison || []).slice(0, 10).map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {cat.category}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        $<BalanceDisplay amount={cat.thisMonth ?? 0} showSign={false} /> {t('analytics.thisMonthValue')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(cat.change ?? 0) > 0 ? (
                        <div className="flex items-center text-red-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-sm font-semibold">
                            +{(cat.change ?? 0).toFixed(1)}%
                          </span>
                        </div>
                      ) : (cat.change ?? 0) < 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          <span className="text-sm font-semibold">
                            {(cat.change ?? 0).toFixed(1)}%
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
            )}
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  )
}
