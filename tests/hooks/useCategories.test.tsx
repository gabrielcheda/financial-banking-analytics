/**
 * Tests for useCategories hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as categoryHooks from '@/hooks/useCategories'
import { categoryService } from '@/services/api/categories.service'
import * as errorUtils from '@/lib/error-utils'
import type { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '@/types/dto'

// Mock services
vi.mock('@/services/api/categories.service')
vi.mock('@/lib/error-utils')

const { 
  useCategories, 
  useCategory, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  useExpenseCategories,
  useIncomeCategories,
  useActiveCategories,
  categoryKeys 
} = categoryHooks

describe('useCategories Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCategories', () => {
    it('should fetch categories with default params', async () => {
      const mockCategories: CategoryDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Groceries',
          type: 'expense' as const,
          color: '#FF5733',
          icon: 'shopping-cart',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCategories)
      expect(categoryService.getCategories).toHaveBeenCalledWith(undefined)
    })

    it('should fetch categories with filters', async () => {
      const mockCategories: CategoryDTO[] = []
      const params = { type: 'income' as const, isActive: true }
      vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useCategories(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(categoryService.getCategories).toHaveBeenCalledWith(params)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(categoryService.getCategories).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCategory', () => {
    it('should fetch category by id', async () => {
      const mockCategory: CategoryDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Salary',
        type: 'income' as const,
        color: '#00FF00',
        icon: 'dollar-sign',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(categoryService.getCategoryById).mockResolvedValue(mockCategory)

      const { result } = renderHook(() => useCategory('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCategory)
      expect(categoryService.getCategoryById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useCategory(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(categoryService.getCategoryById).not.toHaveBeenCalled()
    })
  })

  describe('useCreateCategory', () => {
    it('should create category successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockCategory: CategoryDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Transportation',
        type: 'expense' as const,
        color: '#3498DB',
        icon: 'car',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const categoryData: CreateCategoryDTO = {
        name: 'Transportation',
        type: 'expense' as const,
        color: '#3498DB',
        icon: 'car',
      }

      vi.mocked(categoryService.createCategory).mockResolvedValue(mockCategory)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateCategory(), { wrapper })

      result.current.mutate(categoryData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(categoryService.createCategory).toHaveBeenCalledWith(categoryData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: categoryKeys.lists() })
    })

    it('should handle create error', async () => {
      const mockError = new Error('Create failed')
      vi.mocked(categoryService.createCategory).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateCategory(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({} as CreateCategoryDTO)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Create Category')
    })
  })

  describe('useUpdateCategory', () => {
    it('should update category successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockCategory: CategoryDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Updated Category',
        type: 'expense' as const,
        color: '#FF0000',
        icon: 'edit',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const updateData: UpdateCategoryDTO = { name: 'Updated Category', color: '#FF0000' }

      vi.mocked(categoryService.updateCategory).mockResolvedValue(mockCategory)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdateCategory(), { wrapper })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(categoryService.updateCategory).toHaveBeenCalledWith('1', updateData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: categoryKeys.detail('1') })
    })

    it('should handle update error', async () => {
      const mockError = new Error('Update failed')
      vi.mocked(categoryService.updateCategory).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateCategory(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Update Category')
    })
  })

  describe('useDeleteCategory', () => {
    it('should delete category successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      vi.mocked(categoryService.deleteCategory).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteCategory(), { wrapper })

      result.current.mutate({ id: '1', reassignTo: '2' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('1', '2')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: categoryKeys.lists() })
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: categoryKeys.detail('1') })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] })
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed')
      vi.mocked(categoryService.deleteCategory).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteCategory(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', reassignTo: '2' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Delete Category')
    })
  })

  describe('useExpenseCategories', () => {
    it('should fetch expense categories', async () => {
      const mockCategories: CategoryDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Food',
          type: 'expense' as const,
          color: '#FF5733',
          icon: 'utensils',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(categoryService.getExpenseCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useExpenseCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCategories)
      expect(categoryService.getExpenseCategories).toHaveBeenCalled()
    })
  })

  describe('useIncomeCategories', () => {
    it('should fetch income categories', async () => {
      const mockCategories: CategoryDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Freelance',
          type: 'income' as const,
          color: '#28B463',
          icon: 'briefcase',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(categoryService.getIncomeCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useIncomeCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCategories)
      expect(categoryService.getIncomeCategories).toHaveBeenCalled()
    })
  })

  describe('useActiveCategories', () => {
    it('should fetch active categories', async () => {
      const mockCategories: CategoryDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Active Category',
          type: 'expense' as const,
          color: '#3498DB',
          icon: 'check',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useActiveCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCategories)
      expect(categoryService.getCategories).toHaveBeenCalled()
    })
  })

  describe('categoryKeys', () => {
    it('should generate correct query keys', () => {
      expect(categoryKeys.all).toEqual(['categories'])
      expect(categoryKeys.lists()).toEqual(['categories', 'list'])
      expect(categoryKeys.list({ type: 'expense' })).toEqual(['categories', 'list', { type: 'expense' }])
      expect(categoryKeys.details()).toEqual(['categories', 'detail'])
      expect(categoryKeys.detail('1')).toEqual(['categories', 'detail', '1'])
      expect(categoryKeys.spending({ startDate: '2024-01-01' })).toEqual(['categories', 'spending', { startDate: '2024-01-01' }])
    })
  })
})
