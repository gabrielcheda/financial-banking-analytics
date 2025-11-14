/**
 * Merchant Hooks
 *
 * React Query hooks for managing merchants
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { merchantService } from '@/services/api/merchants.service'
import type {
  MerchantDTO,
  CreateMerchantDTO,
  UpdateMerchantDTO,
  MerchantStatsDTO,
} from '@/types/dto'
import { showErrorToast } from '@/lib/error-utils'

// Query Keys
export const merchantKeys = {
  all: ['merchants'] as const,
  lists: () => [...merchantKeys.all, 'list'] as const,
  list: (params?: any) => [...merchantKeys.lists(), params] as const,
  details: () => [...merchantKeys.all, 'detail'] as const,
  detail: (id: string) => [...merchantKeys.details(), id] as const,
  stats: () => [...merchantKeys.all, 'stats'] as const,
}

/**
 * Hook to list all merchants
 */
export function useMerchants(
  options?: Omit<UseQueryOptions<MerchantDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: merchantKeys.lists(),
    queryFn: () => merchantService.getMerchants(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get merchant by ID
 */
export function useMerchant(
  id: string,
  options?: Omit<UseQueryOptions<MerchantDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: merchantKeys.detail(id),
    queryFn: () => merchantService.getMerchantById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to get merchant statistics
 */
export function useMerchantStats(
  options?: Omit<UseQueryOptions<MerchantStatsDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: merchantKeys.stats(),
    queryFn: () => merchantService.getMerchantStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to create merchant
 */
export function useCreateMerchant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMerchantDTO) => merchantService.createMerchant(data),
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a merchants
      queryClient.invalidateQueries({ queryKey: merchantKeys.all })
      toast.success('Merchant created successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Create Merchant')
    },
  })
}

/**
 * Hook to update merchant
 */
export function useUpdateMerchant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMerchantDTO }) =>
      merchantService.updateMerchant(id, data),
    onSuccess: (_, variables) => {
      // Invalidar todas as queries relacionadas a merchants
      queryClient.invalidateQueries({ queryKey: merchantKeys.all })
      toast.success('Merchant updated successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Merchant')
    },
  })
}

/**
 * Hook to delete merchant
 */
export function useDeleteMerchant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => merchantService.deleteMerchant(id),
    onSuccess: (_, id) => {
      // Invalidar todas as queries relacionadas a merchants
      queryClient.invalidateQueries({ queryKey: merchantKeys.all })
      // Invalidar transactions pois podem ter merchantId vinculado
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Merchant deleted successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Merchant')
    },
  })
}
