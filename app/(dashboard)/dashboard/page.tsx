/**
 * Dashboard Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import DashboardClient from './DashboardClient'
import { accountKeys } from '@/hooks/useAccounts'
import { transactionKeys } from '@/hooks/useTransactions'
import { budgetKeys } from '@/hooks/useBudgets'
import { billKeys } from '@/hooks/useBills'
import { analyticsKeys } from '@/hooks/useAnalytics'
import { accountService } from '@/services/api/accounts.service'
import { transactionService } from '@/services/api/transactions.service'
import { budgetService } from '@/services/api/budgets.service'
import { billService } from '@/services/api/bills.service'
import { analyticsService } from '@/services/api/analytics.service'

export default async function DashboardPage() {
  const queryClient = getQueryClient()
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
  const analyticsParams = { startDate, endDate }
  const cashFlowParams = { ...analyticsParams, interval: 'daily' as const }

  const overviewPromise = queryClient.prefetchQuery({
    queryKey: analyticsKeys.overview(analyticsParams),
    queryFn: () => analyticsService.getOverview(analyticsParams),
  })

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: accountKeys.summary(),
      queryFn: () => accountService.getAccountSummary(),
    }),
    queryClient.prefetchQuery({
      queryKey: accountKeys.list(undefined),
      queryFn: () => accountService.getAccounts(),
    }),
    queryClient.prefetchQuery({
      queryKey: [...transactionKeys.all, 'recent', undefined],
      queryFn: () => transactionService.getRecentTransactions(),
    }),
    queryClient.prefetchQuery({
      queryKey: [...budgetKeys.all, 'current-month'],
      queryFn: () => budgetService.getCurrentPeriodBudgets(),
    }),
    queryClient.prefetchQuery({
      queryKey: billKeys.upcoming(7),
      queryFn: () => billService.getUpcomingBills(7),
    }),
    overviewPromise,
  ])

  const overviewData = queryClient.getQueryData(
    analyticsKeys.overview(analyticsParams)
  ) as Awaited<ReturnType<typeof analyticsService.getOverview>> | undefined
  if (overviewData) {
    queryClient.setQueryData(analyticsKeys.cashFlow(cashFlowParams), (overviewData as any).cashFlow || [])
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
