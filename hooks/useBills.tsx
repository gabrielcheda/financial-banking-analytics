/**
 * Bill Hooks
 *
 * React Query hooks for managing bills
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { billService } from '@/services/api/bills.service'
import { budgetKeys } from './useBudgets'
import { accountKeys } from './useAccounts'
import { transactionKeys } from './useTransactions'
import type {
  BillDTO,
  CreateBillDTO,
  UpdateBillDTO,
  PayBillDTO,
  PayBillResponseDTO,
  PaginatedResponse,
} from '@/types/dto'

// Query Keys
export const billKeys = {
  all: ['bills'] as const,
  lists: () => [...billKeys.all, 'list'] as const,
  list: (params?: any) => [...billKeys.lists(), params] as const,
  details: () => [...billKeys.all, 'detail'] as const,
  detail: (id: string) => [...billKeys.details(), id] as const,
  upcoming: (days?: number) => [...billKeys.all, 'upcoming', days] as const,
  overdue: () => [...billKeys.all, 'overdue'] as const,
}

/**
 * Hook to list all bills
 */
export function useBills(
  params?: {
    page?: number
    limit?: number
    isPaid?: boolean
    isRecurring?: boolean
    startDate?: string
    endDate?: string
  },
  options?: Omit<UseQueryOptions<BillDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billKeys.list(params),
    queryFn: () => billService.getBills(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get bill by ID
 */
export function useBill(
  id: string,
  options?: Omit<UseQueryOptions<BillDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: () => billService.getBillById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to create bill
 */
export function useCreateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBillDTO) => billService.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: transactionKeys.recent(undefined) })
      queryClient.invalidateQueries({ queryKey: accountKeys.summary() })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Create Bill')
    },
  })
}

/**
 * Hook to update bill
 */
export function useUpdateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBillDTO }) =>
      billService.updateBill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.id) })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Bill')
    },
  })
}

/**
 * Hook to delete bill
 */
export function useDeleteBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billService.deleteBill(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      queryClient.removeQueries({ queryKey: billKeys.detail(id) })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Bill')
    },
  })
}

/**
 * Hook to pay bill
 */
export function usePayBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayBillDTO }) =>
      billService.payBill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      queryClient.invalidateQueries({ queryKey: accountKeys.summary() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.recent(undefined) })
      queryClient.invalidateQueries({ queryKey: billKeys.upcoming() })
      queryClient.invalidateQueries({ queryKey: billKeys.upcoming(7) })
      // Invalidar analytics para atualizar graficos e estatisticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Pay Bill')
    },
  })
}

/**
 * Hook to get upcoming bills
 */
export function useUpcomingBills(days: number = 7) {
  return useQuery({
    queryKey: billKeys.upcoming(days),
    queryFn: () => billService.getUpcomingBills(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to get overdue bills
 */
export function useOverdueBills() {
  return useQuery({
    queryKey: billKeys.overdue(),
    queryFn: () => billService.getOverdueBills(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
