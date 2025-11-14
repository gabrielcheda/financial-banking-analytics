/**
 * Reports Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  const queryClient = getQueryClient()

  // TODO: Quando você tiver APIs reais, faça prefetch aqui
  // Exemplo:
  // await queryClient.prefetchQuery({
  //   queryKey: ['reports', 'saved'],
  //   queryFn: () => reportService.getSavedReports()
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['categories'],
  //   queryFn: () => categoryService.getCategories()
  // })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportsClient />
    </HydrationBoundary>
  )
}
