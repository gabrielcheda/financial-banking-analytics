/**
 * Transaction Hooks
 *
 * React Query hooks para gerenciar estado de transações
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { transactionService } from '@/services/api/transactions.service'
import { accountKeys } from './useAccounts'
import type {
  TransactionDTO,
  TransactionDetailsDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFiltersDTO,
  TransactionStatsDTO,
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
}

/**
 * Hook para listar transações com filtros
 */
export function useTransactions(
  filters: TransactionFiltersDTO = {},
  options?: Omit<UseQueryOptions<{ data: TransactionDTO[]; meta: { total: number; page: number; limit: number; totalPages: number } }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
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
 * Hook para estatísticas de transações
 * TODO: Implement getStats method in TransactionService
 */
// export function useTransactionStats(
//   startDate: string,
//   endDate: string,
//   accountId?: string,
//   options?: Omit<UseQueryOptions<TransactionStatsDTO>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery({
//     queryKey: transactionKeys.stats(startDate, endDate, accountId),
//     queryFn: () => transactionService.getStats(startDate, endDate, accountId),
//     enabled: !!startDate && !!endDate,
//     staleTime: 1000 * 60 * 10, // 10 minutos
//     ...options,
//   })
// }

/**
 * Hook para criar transação
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => transactionService.createTransaction(data),
    onSuccess: (response) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      // Invalidar todas as queries de accounts (lists, summary, active, etc)
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      // Invalidar budgets para atualizar spent amounts
      queryClient.invalidateQueries({ queryKey: ['budgets'] })

      toast.success('Transaction created successfully!')
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) })
      // Invalidar todas as queries de accounts (lists, summary, active, etc)
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      // Invalidar budgets para atualizar spent amounts
      queryClient.invalidateQueries({ queryKey: ['budgets'] })

      toast.success('Transaction updated successfully!')
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) })
      // Invalidar todas as queries de accounts (lists, summary, active, etc)
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      // Invalidar budgets para atualizar spent amounts
      queryClient.invalidateQueries({ queryKey: ['budgets'] })

      toast.success('Transaction deleted successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Transaction')
    },
  })
}

/**
 * Hook para importar transações
 */
export function useImportTransactions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) =>
      transactionService.importTransactions(file),
    onSuccess: (result) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      // Invalidar todas as queries de accounts (lists, summary, active, etc)
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
      // Invalidar analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      // Invalidar budgets para atualizar spent amounts
      queryClient.invalidateQueries({ queryKey: ['budgets'] })

      toast.success(
        `Import completed! ${result.imported} imported, ${result.failed} failed`
      )
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Import Transactions')
    },
  })
}

/**
 * Hook para exportar transações
 */
export function useExportTransactions() {
  return useMutation({
    mutationFn: (filters: TransactionFiltersDTO) => transactionService.exportTransactions(filters),
    onSuccess: () => {
      toast.success('Export completed successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Export Transactions')
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
    queryKey: [...transactionKeys.all, 'recent', accountId],
    queryFn: () => transactionService.getRecentTransactions(accountId),
    staleTime: 1000 * 60 * 1, // 1 minuto
  })
}
