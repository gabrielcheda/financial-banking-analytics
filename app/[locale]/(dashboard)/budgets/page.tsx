import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Metadata } from 'next'
import { getQueryClient } from '@/lib/queryClient'
import BudgetsClient from './BudgetsClient'
import { budgetService } from '@/services/api/budgets.service'
import { budgetKeys } from '@/hooks/useBudgets'

export const metadata: Metadata = {
  title: 'Budgets | BankDash',
  description: 'Manage your budgets and spending limits',
}

export default async function BudgetsPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: budgetKeys.list(undefined),
      queryFn: () => budgetService.getBudgets(),
    }),
    queryClient.prefetchQuery({
      queryKey: [...budgetKeys.all, 'current-month'],
      queryFn: () => budgetService.getCurrentPeriodBudgets(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BudgetsClient />
    </HydrationBoundary>
  )
}
