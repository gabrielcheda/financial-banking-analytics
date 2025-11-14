/**
 * Category Hooks
 *
 * React Query hooks for managing categories
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { categoryService } from '@/services/api/categories.service'
import type {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategorySpendingDTO,
} from '@/types/dto'

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: any) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  spending: (params: any) => [...categoryKeys.all, 'spending', params] as const,
}

/**
 * Hook to list all categories
 */
export function useCategories(
  params?: {
    type?: 'income' | 'expense'
    isActive?: boolean
  },
  options?: Omit<UseQueryOptions<CategoryDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getCategories(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (categories don't change often)
    ...options,
  })
}

/**
 * Hook to get category by ID
 */
export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<CategoryDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to create category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success('Category created successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Create Category')
    },
  })
}

/**
 * Hook to update category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) })
      toast.success('Category updated successfully!')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Update Category')
    },
  })
}

/**
 * Hook to delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reassignTo }: { id: string; reassignTo: string }) =>
      categoryService.deleteCategory(id, reassignTo),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.removeQueries({ queryKey: categoryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(`Category deleted! ${data.transactionsReassigned} transactions reassigned.`)
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Delete Category')
    },
  })
}

/**
 * Hook to get category spending
 * TODO: Implement getCategorySpending method in CategoryService
 */
// export function useCategorySpending(
//   params: {
//     startDate: string
//     endDate: string
//     type?: 'income' | 'expense'
//   },
//   options?: Omit<UseQueryOptions<CategorySpendingDTO[]>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery({
//     queryKey: categoryKeys.spending(params),
//     queryFn: () => categoryService.getCategorySpending(params),
//     enabled: !!params.startDate && !!params.endDate,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     ...options,
//   })
// }

/**
 * Hook to get expense categories
 */
export function useExpenseCategories() {
  return useQuery({
    queryKey: [...categoryKeys.all, 'expense'],
    queryFn: () => categoryService.getExpenseCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to get income categories
 */
export function useIncomeCategories() {
  return useQuery({
    queryKey: [...categoryKeys.all, 'income'],
    queryFn: () => categoryService.getIncomeCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to get active categories
 */
export function useActiveCategories() {
  return useQuery({
    queryKey: [...categoryKeys.all, 'active'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
