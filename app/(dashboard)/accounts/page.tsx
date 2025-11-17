import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import AccountsClient from './AccountsClient'
import { accountService } from '@/services/api/accounts.service'
import { accountKeys } from '@/hooks/useAccounts'

export const metadata = {
  title: 'Accounts | BankDash',
  description: 'Manage your financial accounts',
}

export default async function AccountsPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: accountKeys.list(undefined),
      queryFn: () => accountService.getAccounts(),
    }),
    queryClient.prefetchQuery({
      queryKey: accountKeys.summary(),
      queryFn: () => accountService.getAccountSummary(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsClient />
    </HydrationBoundary>
  )
}
