/**
 * Transaction Hooks
 *
 * React Query hooks para gerenciar estado de transações
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { transactionService } from '@/services/api/transactions.service'
import { accountKeys } from './useAccounts'
import { merchantKeys } from './useMerchants'
import { analyticsKeys } from './useAnalytics'
import { budgetKeys } from './useBudgets'
import { billKeys } from './useBills'
import type {
  TransactionDTO,
  TransactionDetailsDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFiltersDTO,
  PaginatedResponse,
} from '@/types/dto'

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFiltersDTO) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  stats: (startDate: string, endDate: string, accountId?: string) =>
    [...transactionKeys.all, 'stats', { startDate, endDate, accountId }] as const,
  recent: (accountId?: string) => [...transactionKeys.all, 'recent', accountId] as const,
}

const invalidateTransactionDependencies = (
  queryClient: QueryClient,
  options?: { transactionId?: string }
) => {
  queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
  if (options?.transactionId) {
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(options.transactionId) })
  }
  queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'recent'] })
  queryClient.invalidateQueries({ queryKey: transactionKeys.recent(undefined) })
  queryClient.invalidateQueries({ queryKey: accountKeys.all })
  queryClient.invalidateQueries({ queryKey: accountKeys.summary() })
  queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
  queryClient.invalidateQueries({ queryKey: budgetKeys.all })
  queryClient.invalidateQueries({ queryKey: billKeys.all })
  queryClient.invalidateQueries({ queryKey: billKeys.upcoming() })
  queryClient.invalidateQueries({ queryKey: ['reports'] })
  queryClient.invalidateQueries({ queryKey: merchantKeys.all })
}

/**
 * Hook para listar transações com filtros
 */
export function useTransactions(
  filters: TransactionFiltersDTO = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<TransactionDTO>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<TransactionDTO>>({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionService.getTransactions(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    ...options,
  })
}

/**
 * Hook para buscar transação por ID
 */
export function useTransaction(
  id: string,
  options?: Omit<UseQueryOptions<TransactionDetailsDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook para criar transação
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => transactionService.createTransaction(data),
    onSuccess: (response) => {
      invalidateTransactionDependencies(queryClient)
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Create Transaction')
    },
  })
}

/**
 * Hook para atualizar transação
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDTO }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: (response, variables) => {
      invalidateTransactionDependencies(queryClient, { transactionId: variables.id })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Transaction')
    },
  })
}

/**
 * Hook para deletar transação
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: (_, id) => {
      invalidateTransactionDependencies(queryClient, { transactionId: id })
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Transaction')
    },
  })
}

/**
 * Hook para exportar transações
 */
export function useExportTransactions() {
  return useMutation({
    mutationFn: (filters: TransactionFiltersDTO) => transactionService.exportTransactions(filters),
    onSuccess: (blob) => {
      if (typeof window !== 'undefined' && blob instanceof Blob) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().split('T')[0]
        link.download = `transactions-${timestamp}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Export Transactions')
    },
  })
}

/**
 * Hook para importar transações de CSV
 */
export function useImportTransactions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => transactionService.importCsv(file),
    onSuccess: (result) => {
      invalidateTransactionDependencies(queryClient)
      
      if (result.errors.length > 0) {
        toast.warning(
          `Imported ${result.imported} transactions. ${result.errors.length} failed.`,
          {
            description: result.errors?.slice(0, 3).join('\n'),
          }
        )
      }
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Import Transactions')
    },
  })
}

/**
 * Hook para busca de transações
 */
export function useSearchTransactions(query: string) {
  return useQuery({
    queryKey: [...transactionKeys.lists(), 'search', query],
    queryFn: () => transactionService.searchTransactions(query),
    enabled: query.length >= 3, // Só busca com 3+ caracteres
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

/**
 * Hook para transações recentes
 */
export function useRecentTransactions(accountId?: string) {
  return useQuery({
    queryKey: transactionKeys.recent(accountId),
    queryFn: () => transactionService.getRecentTransactions(accountId),
    staleTime: 1000 * 60 * 1, // 1 minuto
  })
}
