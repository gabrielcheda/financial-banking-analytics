import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useBudgets,
  useBudget,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useCurrentMonthBudgets,
  useBudgetAlerts,
  useBudgetStatus,
  budgetKeys,
} from '@/hooks/useBudgets'
import { budgetService } from '@/services/api/budgets.service'
import * as errorUtils from '@/lib/error-utils'

vi.mock('@/services/api/budgets.service', () => ({
  budgetService: {
    getBudgets: vi.fn(),
    getBudgetById: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    getCurrentPeriodBudgets: vi.fn(),
    getBudgetAlerts: vi.fn(),
    getBudgetStatus: vi.fn(),
  },
}))

vi.mock('@/lib/error-utils', () => ({
  showErrorToast: vi.fn(),
}))

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

describe('useBudgets Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useBudgets', () => {
    it('should fetch budgets successfully', async () => {
      const mockBudgets = [
        { id: '1', name: 'Groceries', amount: 500, period: 'monthly' },
        { id: '2', name: 'Transport', amount: 200, period: 'monthly' },
      ]

      vi.mocked(budgetService.getBudgets).mockResolvedValue(mockBudgets)

      const { result } = renderHook(() => useBudgets(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.getBudgets).toHaveBeenCalledWith(undefined)
      expect(result.current.data).toEqual(mockBudgets)
    })

    it('should fetch budgets with filters', async () => {
      const params = { period: 'monthly' as const, categoryId: '123' }
      const mockBudgets = [
        { id: '1', name: 'Monthly Budget', amount: 1000, period: 'monthly' },
      ]

      vi.mocked(budgetService.getBudgets).mockResolvedValue(mockBudgets)

      const { result } = renderHook(() => useBudgets(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.getBudgets).toHaveBeenCalledWith(params)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch budgets')
      vi.mocked(budgetService.getBudgets).mockRejectedValue(mockError)

      const { result } = renderHook(() => useBudgets(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useBudget', () => {
    it('should fetch budget by id', async () => {
      const mockBudget = {
        id: '1',
        name: 'Groceries',
        amount: 500,
        period: 'monthly',
        spent: 300,
      }

      vi.mocked(budgetService.getBudgetById).mockResolvedValue(mockBudget)

      const { result } = renderHook(() => useBudget('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.getBudgetById).toHaveBeenCalledWith('1')
      expect(result.current.data).toEqual(mockBudget)
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useBudget(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(budgetService.getBudgetById).not.toHaveBeenCalled()
    })

    it('should handle budget fetch error', async () => {
      const mockError = new Error('Budget not found')
      vi.mocked(budgetService.getBudgetById).mockRejectedValue(mockError)

      const { result } = renderHook(() => useBudget('999'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCreateBudget', () => {
    it('should create budget successfully', async () => {
      const newBudget = {
        name: 'Entertainment',
        amount: 300,
        period: 'monthly' as const,
        categoryId: '123',
      }

      const mockResponse = { id: '3', ...newBudget }
      vi.mocked(budgetService.createBudget).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCreateBudget(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newBudget)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.createBudget).toHaveBeenCalledWith(newBudget)
    })

    it('should invalidate queries after creating budget', async () => {
      const newBudget = {
        name: 'New Budget',
        amount: 1000,
        period: 'monthly' as const,
        categoryId: '123',
      }

      vi.mocked(budgetService.createBudget).mockResolvedValue({} as any)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateBudget(), { wrapper })

      result.current.mutate(newBudget)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: budgetKeys.lists() })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: budgetKeys.alerts() })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
    })

    it('should handle create budget error', async () => {
      const newBudget = {
        name: 'Invalid Budget',
        amount: -100,
        period: 'monthly' as const,
        categoryId: '123',
      }

      const mockError = new Error('Invalid amount')
      vi.mocked(budgetService.createBudget).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateBudget(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newBudget)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Create Budget')
    })
  })

  describe('useUpdateBudget', () => {
    it('should update budget successfully', async () => {
      const updateData = { amount: 600, name: 'Updated Budget' }
      const mockResponse = { id: '1', ...updateData }

      vi.mocked(budgetService.updateBudget).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUpdateBudget(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.updateBudget).toHaveBeenCalledWith('1', updateData)
    })

    it('should invalidate specific budget after update', async () => {
      const updateData = { amount: 700 }

      vi.mocked(budgetService.updateBudget).mockResolvedValue({} as any)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdateBudget(), { wrapper })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: budgetKeys.detail('1') })
    })

    it('should handle update budget error', async () => {
      const updateData = { amount: 500 }
      const mockError = new Error('Failed to update')

      vi.mocked(budgetService.updateBudget).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateBudget(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Update Budget')
    })
  })

  describe('useDeleteBudget', () => {
    it('should delete budget successfully', async () => {
      vi.mocked(budgetService.deleteBudget).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteBudget(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.deleteBudget).toHaveBeenCalledWith('1')
    })

    it('should remove query after deletion', async () => {
      vi.mocked(budgetService.deleteBudget).mockResolvedValue(undefined)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteBudget(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(removeSpy).toHaveBeenCalledWith({ queryKey: budgetKeys.detail('1') })
    })

    it('should handle delete budget error', async () => {
      const mockError = new Error('Cannot delete budget')

      vi.mocked(budgetService.deleteBudget).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteBudget(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Delete Budget')
    })
  })

  describe('useCurrentMonthBudgets', () => {
    it('should fetch current month budgets', async () => {
      const mockBudgets = [
        { id: '1', name: 'November Groceries', amount: 500, period: 'monthly' },
        { id: '2', name: 'November Transport', amount: 200, period: 'monthly' },
      ]

      vi.mocked(budgetService.getCurrentPeriodBudgets).mockResolvedValue(mockBudgets)

      const { result } = renderHook(() => useCurrentMonthBudgets(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.getCurrentPeriodBudgets).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockBudgets)
    })
  })

  describe('useBudgetAlerts', () => {
    it('should fetch budget alerts', async () => {
      const mockAlerts = [
        { budgetId: '1', message: 'Budget exceeded', severity: 'high' },
        { budgetId: '2', message: '80% spent', severity: 'medium' },
      ]

      vi.mocked(budgetService.getBudgetAlerts).mockResolvedValue(mockAlerts)

      const { result } = renderHook(() => useBudgetAlerts(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.getBudgetAlerts).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockAlerts)
    })
  })

  describe('useBudgetStatus', () => {
    it('should fetch budget status', async () => {
      const mockStatus = {
        budget: { id: '1', name: 'Groceries', amount: 500 },
        spent: 350,
        remaining: 150,
        percentageUsed: 70,
        isOverBudget: false,
      }

      vi.mocked(budgetService.getBudgetStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useBudgetStatus('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(budgetService.getBudgetStatus).toHaveBeenCalledWith('1')
      expect(result.current.data).toEqual(mockStatus)
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useBudgetStatus(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(budgetService.getBudgetStatus).not.toHaveBeenCalled()
    })
  })

  describe('budgetKeys', () => {
    it('should generate correct query keys', () => {
      expect(budgetKeys.all).toEqual(['budgets'])
      expect(budgetKeys.lists()).toEqual(['budgets', 'list'])
      expect(budgetKeys.list({ period: 'monthly' })).toEqual(['budgets', 'list', { period: 'monthly' }])
      expect(budgetKeys.details()).toEqual(['budgets', 'detail'])
      expect(budgetKeys.detail('123')).toEqual(['budgets', 'detail', '123'])
      expect(budgetKeys.alerts()).toEqual(['budgets', 'alerts'])
    })
  })
})
