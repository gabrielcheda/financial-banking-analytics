/**
 * Planning Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import PlanningClient from './PlanningClient'
import { goalKeys } from '@/hooks/useGoals'
import { budgetKeys } from '@/hooks/useBudgets'
import { billKeys } from '@/hooks/useBills'
import { goalService } from '@/services/api/goals.service'
import { budgetService } from '@/services/api/budgets.service'
import { billService } from '@/services/api/bills.service'

export default async function PlanningPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [...goalKeys.all, 'active'],
      queryFn: () => goalService.getActiveGoals(),
    }),
    queryClient.prefetchQuery({
      queryKey: goalKeys.list(undefined),
      queryFn: () => goalService.getGoals(),
    }),
    queryClient.prefetchQuery({
      queryKey: [...budgetKeys.all, 'current-month'],
      queryFn: () => budgetService.getCurrentPeriodBudgets(),
    }),
    queryClient.prefetchQuery({
      queryKey: billKeys.upcoming(30),
      queryFn: () => billService.getUpcomingBills(30),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlanningClient />
    </HydrationBoundary>
  )
}
