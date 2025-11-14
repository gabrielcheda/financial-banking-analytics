/**
 * Analytics Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const queryClient = getQueryClient()

  // TODO: Quando você tiver APIs reais, faça prefetch aqui
  // Exemplo:
  // await queryClient.prefetchQuery({
  //   queryKey: ['analytics', 'overview'],
  //   queryFn: () => analyticsService.getOverview()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['analytics', 'spending'],
  //   queryFn: () => analyticsService.getSpending()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['categories'],
  //   queryFn: () => categoryService.getCategories()
  // })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsClient />
    </HydrationBoundary>
  )
}
