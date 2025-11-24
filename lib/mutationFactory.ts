/**
 * Mutation Factory
 * 
 * Centralized mutation configuration with standardized invalidation patterns
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import type { ApiResponse } from '@/types/dto'

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>
  invalidateKeys?: readonly unknown[][]
  removeKeys?: readonly unknown[][]
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: ApiResponse<TData>, variables: TVariables) => void
  onError?: (error: unknown, variables: TVariables) => void
  optimistic?: boolean
}

/**
 * Create mutation with automatic invalidation and toast notifications
 */
export function createMutation<TData = unknown, TVariables = unknown>(
  config: MutationConfig<TData, TVariables>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, unknown, TVariables>, 'mutationFn'>
) {
  return function useMutationHook() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: config.mutationFn,
      onSuccess: (data, variables) => {
        // Invalidate queries
        if (config.invalidateKeys) {
          config.invalidateKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key })
          })
        }

        // Remove queries
        if (config.removeKeys) {
          config.removeKeys.forEach((key) => {
            queryClient.removeQueries({ queryKey: key })
          })
        }

        // Show success toast
        if (config.successMessage) {
          toast.success(config.successMessage)
        }

        // Custom success handler
        config.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        // Show error toast
        showErrorToast(error, config.errorMessage || 'Operation failed')

        // Custom error handler
        config.onError?.(error, variables)
      },
      ...options,
    })
  }
}

/**
 * Standard CRUD mutation patterns
 */
export const mutationPatterns = {
  /**
   * Create pattern: invalidates list queries
   */
  create: <TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    listKey: readonly unknown[],
    resourceName: string
  ) => ({
    mutationFn,
    invalidateKeys: [listKey],
    successMessage: `${resourceName} created successfully!`,
    errorMessage: `Failed to create ${resourceName.toLowerCase()}`,
  }),

  /**
   * Update pattern: invalidates list and detail queries
   */
  update: <TData, TVariables extends { id: string }>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    listKey: readonly unknown[],
    detailKeyFn: (id: string) => readonly unknown[],
    resourceName: string
  ) => ({
    mutationFn,
    invalidateKeys: [listKey],
    successMessage: `${resourceName} updated successfully!`,
    errorMessage: `Failed to update ${resourceName.toLowerCase()}`,
    onSuccess: (data: ApiResponse<TData>, variables: TVariables) => {
      // Also invalidate specific detail query
      return detailKeyFn(variables.id)
    },
  }),

  /**
   * Delete pattern: invalidates list and removes detail query
   */
  delete: <TData, TVariables extends { id: string } | string>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    listKey: readonly unknown[],
    detailKeyFn: (id: string) => readonly unknown[],
    resourceName: string
  ) => ({
    mutationFn,
    invalidateKeys: [listKey],
    successMessage: `${resourceName} deleted successfully!`,
    errorMessage: `Failed to delete ${resourceName.toLowerCase()}`,
    onSuccess: (data: ApiResponse<TData>, variables: TVariables) => {
      const id = typeof variables === 'string' ? variables : variables.id
      return detailKeyFn(id)
    },
  }),

  /**
   * Action pattern: for actions like "pay bill", "contribute to goal"
   */
  action: <TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    invalidateKeys: readonly unknown[][],
    actionName: string,
    resourceName: string
  ) => ({
    mutationFn,
    invalidateKeys,
    successMessage: `${actionName} successful!`,
    errorMessage: `Failed to ${actionName.toLowerCase()} ${resourceName.toLowerCase()}`,
  }),
}

/**
 * Common invalidation patterns for related resources
 */
export const invalidationPatterns = {
  /**
   * When transactions change, invalidate related resources
   */
  transactionChange: (queryKeyFactory: any) => [
    queryKeyFactory.transactions.all,
    queryKeyFactory.accounts.all,
    queryKeyFactory.analytics.all,
    queryKeyFactory.budgets.all,
    queryKeyFactory.reports.all,
  ],

  /**
   * When accounts change, invalidate analytics
   */
  accountChange: (queryKeyFactory: any) => [
    queryKeyFactory.accounts.all,
    queryKeyFactory.analytics.all,
  ],

  /**
   * When budgets change, invalidate analytics
   */
  budgetChange: (queryKeyFactory: any) => [
    queryKeyFactory.budgets.all,
    queryKeyFactory.analytics.all,
  ],

  /**
   * When bills change, invalidate related resources
   */
  billChange: (queryKeyFactory: any) => [
    queryKeyFactory.bills.all,
    queryKeyFactory.transactions.all,
    queryKeyFactory.accounts.all,
    queryKeyFactory.analytics.all,
  ],

  /**
   * When goals change, invalidate analytics
   */
  goalChange: (queryKeyFactory: any) => [
    queryKeyFactory.goals.all,
    queryKeyFactory.analytics.all,
  ],

  /**
   * When categories change, invalidate related resources
   */
  categoryChange: (queryKeyFactory: any) => [
    queryKeyFactory.categories.all,
    queryKeyFactory.transactions.all,
    queryKeyFactory.budgets.all,
    queryKeyFactory.goals.all,
  ],
}
