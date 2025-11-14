/**
 * Transactions Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import TransactionsClient from './TransactionsClient'

export default async function TransactionsPage() {
  const queryClient = getQueryClient()

  // TODO: Quando você tiver APIs reais, faça prefetch aqui
  // Exemplo:
  // await queryClient.prefetchQuery({
  //   queryKey: transactionKeys.list({}),
  //   queryFn: () => transactionService.getTransactions({})
  // })
  //
  // await queryClient.prefetchQuery({
  //   queryKey: ['categories'],
  //   queryFn: () => categoryService.getCategories()
  // })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsClient />
    </HydrationBoundary>
  )
}
