/**
 * Planning Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import PlanningClient from './PlanningClient'

export default async function PlanningPage() {
  const queryClient = getQueryClient()

  // TODO: Quando você tiver APIs reais, faça prefetch aqui
  // Exemplo:
  // await queryClient.prefetchQuery({
  //   queryKey: ['goals'],
  //   queryFn: () => goalService.getGoals()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['budgets'],
  //   queryFn: () => budgetService.getBudgets()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['bills'],
  //   queryFn: () => billService.getBills()
  // })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlanningClient />
    </HydrationBoundary>
  )
}
