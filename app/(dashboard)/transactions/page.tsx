/**
 * Transactions Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import TransactionsClient from './TransactionsClient'
import { transactionKeys } from '@/hooks/useTransactions'
import { categoryKeys } from '@/hooks/useCategories'
import { transactionService } from '@/services/api/transactions.service'
import { categoryService } from '@/services/api/categories.service'

export default async function TransactionsPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: transactionKeys.list({ page: 1, limit: 20 }),
      queryFn: () => transactionService.getTransactions({ page: 1, limit: 20 }),
    }),
    queryClient.prefetchQuery({
      queryKey: categoryKeys.list(undefined),
      queryFn: () => categoryService.getCategories(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsClient />
    </HydrationBoundary>
  )
}
