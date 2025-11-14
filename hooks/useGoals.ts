/**
 * Goal Hooks
 *
 * React Query hooks for managing financial goals
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { goalService } from '@/services/api/goals.service'
import type {
  GoalDTO,
  CreateGoalDTO,
  UpdateGoalDTO,
  ContributeToGoalDTO,
  ContributeToGoalResponseDTO,
  PaginatedResponse,
} from '@/types/dto'

// Query Keys
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (params?: any) => [...goalKeys.lists(), params] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
  progress: () => [...goalKeys.all, 'progress'] as const,
}

/**
 * Hook to list all goals
 */
export function useGoals(
  params?: {
    page?: number
    limit?: number
    status?: 'active' | 'completed' | 'cancelled'
    priority?: 'low' | 'medium' | 'high'
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<GoalDTO>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: goalKeys.list(params),
    queryFn: () => goalService.getGoals(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get goal by ID
 */
export function useGoal(
  id: string,
  options?: Omit<UseQueryOptions<GoalDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalService.getGoalById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to create goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalDTO) => goalService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: goalKeys.progress() })
      toast.success('Goal created successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Create Goal')
    },
  })
}

/**
 * Hook to update goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalDTO }) =>
      goalService.updateGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.progress() })
      toast.success('Goal updated successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Goal')
    },
  })
}

/**
 * Hook to delete goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.removeQueries({ queryKey: goalKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.progress() })
      toast.success('Goal deleted successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Goal')
    },
  })
}

/**
 * Hook to contribute to goal
 */
export function useContributeToGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributeToGoalDTO }) =>
      goalService.contributeToGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.progress() })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      // Invalidar analytics para atualizar gráficos e estatísticas
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Contribution added successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Add Contribution')
    },
  })
}

/**
 * Hook to get active goals
 */
export function useActiveGoals() {
  return useQuery({
    queryKey: [...goalKeys.all, 'active'],
    queryFn: () => goalService.getActiveGoals(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to get goal progress
 */
export function useGoalProgress() {
  return useQuery({
    queryKey: goalKeys.progress(),
    queryFn: () => goalService.getGoalProgress(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
