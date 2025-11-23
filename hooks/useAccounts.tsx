/**
 * Account Hooks
 *
 * React Query hooks for managing accounts
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { accountService } from '@/services/api/accounts.service'
import type {
  AccountDTO,
  AccountDetailsDTO,
  CreateAccountDTO,
  UpdateAccountDTO,
  AccountSummaryDTO,
} from '@/types/dto'
import { showErrorToast } from '@/lib/error-utils'

// Query Keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params?: any) => [...accountKeys.lists(), params] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
  summary: () => [...accountKeys.all, 'summary'] as const,
  balance: (id: string) => [...accountKeys.all, 'balance', id] as const,
}

/**
 * Hook to list all accounts
 */
export function useAccounts(
  params?: {
    page?: number
    limit?: number
    type?: string
    isActive?: boolean
  },
  options?: Omit<UseQueryOptions<AccountDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AccountDTO[]>({
    queryKey: accountKeys.list(params),
    queryFn: () => accountService.getAccounts(params),
    ...options,
  })
}

/**
 * Hook to get account by ID
 */
export function useAccount(
  id: string,
  options?: Omit<UseQueryOptions<AccountDetailsDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountService.getAccountById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to get account summary
 */
export function useAccountSummary(
  options?: Omit<UseQueryOptions<AccountSummaryDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: accountKeys.summary(),
    queryFn: () => accountService.getAccountSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get account balance with pending transactions
 */
export function useAccountBalance(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: accountKeys.balance(id),
    queryFn: () => accountService.getAccountBalance(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  })
}

/**
 * Hook to create account
 */
export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAccountDTO) => await accountService.createAccount(data),
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a accounts
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar analytics para atualizar gráficos e estatísticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Account created successfully!')
    },
    onError: (error, _, result) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('error', (result as any))
      }
      showErrorToast(error, (error as any)?.data?.error?.message || 'Failed to Create Account')
    },
  })
}

/**
 * Hook to update account
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDTO }) =>
      accountService.updateAccount(id, data),
    onSuccess: (_, variables) => {
      // Invalidar todas as queries relacionadas a accounts
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar analytics para atualizar gráficos e estatísticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Account updated successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Account')
    },
  })
}

/**
 * Hook to delete account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, transferToAccountId }: { id: string; transferToAccountId?: string }) =>
      accountService.deleteAccount(id, transferToAccountId),
    onSuccess: (_, variables) => {
      // Invalidar todas as queries relacionadas a accounts
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar todas as transactions pois a conta foi deletada
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      // Invalidar analytics e budgets tambem
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Account deleted successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Account')
    },
  })
}


/**
 * Hook to get active accounts
 */
export function useActiveAccounts(
  options?: Omit<UseQueryOptions<AccountDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AccountDTO[]>({
    queryKey: [...accountKeys.all, 'active'],
    queryFn: () => accountService.getActiveAccounts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}
