/**
 * Dashboard Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const queryClient = getQueryClient()

  // TODO: Quando você tiver APIs reais, faça prefetch aqui
  // Exemplo:
  // await queryClient.prefetchQuery({
  //   queryKey: ['accounts'],
  //   queryFn: () => accountService.getAccounts()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['transactions', 'recent'],
  //   queryFn: () => transactionService.getRecentTransactions()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['budgets'],
  //   queryFn: () => budgetService.getBudgets()
  // })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
