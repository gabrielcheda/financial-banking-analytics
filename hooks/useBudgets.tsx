/**
 * Budget Hooks
 *
 * React Query hooks for managing budgets
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { budgetService } from '@/services/api/budgets.service'
import type {
  BudgetDTO,
  CreateBudgetDTO,
  UpdateBudgetDTO,
  PaginatedResponse,
} from '@/types/dto'

// Query Keys
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (params?: any) => [...budgetKeys.lists(), params] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  alerts: () => [...budgetKeys.all, 'alerts'] as const,
}

/**
 * Hook to list all budgets
 */
export function useBudgets(
  params?: {
    page?: number
    limit?: number
    period?: 'monthly' | 'yearly'
    categoryId?: string
  },
  options?: Omit<UseQueryOptions<BudgetDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: budgetKeys.list(params),
    queryFn: () => budgetService.getBudgets(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get budget by ID
 */
export function useBudget(
  id: string,
  options?: Omit<UseQueryOptions<BudgetDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => budgetService.getBudgetById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to create budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetDTO) => budgetService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...budgetKeys.all, 'current-month'] })
      queryClient.invalidateQueries({ queryKey: budgetKeys.alerts() })
      // Invalidar analytics para atualizar gráficos e estatísticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Create Budget')
    },
  })
}

/**
 * Hook to update budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDTO }) =>
      budgetService.updateBudget(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: [...budgetKeys.all, 'current-month'] })
      queryClient.invalidateQueries({ queryKey: budgetKeys.alerts() })
      // Invalidar analytics para atualizar gráficos e estatísticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Budget')
    },
  })
}

/**
 * Hook to delete budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.removeQueries({ queryKey: budgetKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: [...budgetKeys.all, 'current-month'] })
      queryClient.invalidateQueries({ queryKey: budgetKeys.alerts() })
      // Invalidar analytics para atualizar gráficos e estatísticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Budget')
    },
  })
}

/**
 * Hook to get current month budgets
 */
export function useCurrentMonthBudgets() {
  return useQuery({
    queryKey: [...budgetKeys.all, 'current-month'],
    queryFn: () => budgetService.getCurrentPeriodBudgets(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to get budget alerts
 */
export function useBudgetAlerts() {
  return useQuery({
    queryKey: budgetKeys.alerts(),
    queryFn: () => budgetService.getBudgetAlerts(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to get budget status (spent, remaining, etc.)
 */
export function useBudgetStatus(
  id: string,
  options?: Omit<UseQueryOptions<{
    budget: BudgetDTO
    spent: number
    remaining: number
    percentageUsed: number
    isOverBudget: boolean
  }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...budgetKeys.detail(id), 'status'],
    queryFn: () => budgetService.getBudgetStatus(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  })
}
