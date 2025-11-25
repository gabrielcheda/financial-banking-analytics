/**
 * Tests for useGoals hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as goalHooks from '@/hooks/useGoals'
import { goalService } from '@/services/api/goals.service'
import * as errorUtils from '@/lib/error-utils'
import type { 
  GoalDTO, 
  CreateGoalDTO, 
  UpdateGoalDTO, 
  ContributeToGoalDTO, 
  ContributeToGoalResponseDTO,
  PaginatedResponse 
} from '@/types/dto'

// Mock services
vi.mock('@/services/api/goals.service')
vi.mock('@/lib/error-utils')

const { 
  useGoals, 
  useGoal, 
  useCreateGoal, 
  useUpdateGoal, 
  useDeleteGoal,
  useContributeToGoal,
  useActiveGoals,
  useGoalProgress,
  goalKeys 
} = goalHooks

describe('useGoals Hooks', () => {
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

  describe('useGoals', () => {
    it('should fetch goals with default params', async () => {
      const mockResponse: PaginatedResponse<GoalDTO> = {
        data: [
          {
            id: '1',
            userId: 'user-1',
            name: 'Vacation Fund',
            targetAmount: 5000.00,
            currentAmount: 1500.00,
            targetDate: new Date('2024-12-31'),
            priority: 'high' as const,
            status: 'active' as const,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      vi.mocked(goalService.getGoals).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useGoals(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(goalService.getGoals).toHaveBeenCalledWith(undefined)
    })

    it('should fetch goals with filters', async () => {
      const mockResponse: PaginatedResponse<GoalDTO> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      const params = { status: 'active' as const, priority: 'high' as const }
      vi.mocked(goalService.getGoals).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useGoals(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalService.getGoals).toHaveBeenCalledWith(params)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(goalService.getGoals).mockRejectedValue(mockError)

      const { result } = renderHook(() => useGoals(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useGoal', () => {
    it('should fetch goal by id', async () => {
      const mockGoal: GoalDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Emergency Fund',
        targetAmount: 10000.00,
        currentAmount: 3000.00,
        targetDate: new Date('2025-01-01'),
        priority: 'high' as const,
        status: 'active' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(goalService.getGoalById).mockResolvedValue(mockGoal)

      const { result } = renderHook(() => useGoal('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockGoal)
      expect(goalService.getGoalById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useGoal(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(goalService.getGoalById).not.toHaveBeenCalled()
    })
  })

  describe('useCreateGoal', () => {
    it('should create goal successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockGoal: GoalDTO = {
        id: '1',
        userId: 'user-1',
        name: 'New Car',
        targetAmount: 20000.00,
        currentAmount: 0,
        targetDate: new Date('2025-06-01'),
        priority: 'medium' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const goalData: CreateGoalDTO = {
        name: 'New Car',
        targetAmount: 20000.00,
        currentAmount: 0,
        targetDate: new Date('2025-06-01'),
        priority: 'medium' as const,
      }

      vi.mocked(goalService.createGoal).mockResolvedValue(mockGoal)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateGoal(), { wrapper })

      result.current.mutate(goalData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalService.createGoal).toHaveBeenCalledWith(goalData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.lists() })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.progress() })
    })

    it('should handle create error', async () => {
      const mockError = new Error('Create failed')
      vi.mocked(goalService.createGoal).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateGoal(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({} as CreateGoalDTO)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Create Goal')
    })
  })

  describe('useUpdateGoal', () => {
    it('should update goal successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockGoal: GoalDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Updated Goal',
        targetAmount: 15000.00,
        currentAmount: 5000.00,
        targetDate: new Date('2025-12-31'),
        priority: 'high' as const,
        status: 'active' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const updateData: UpdateGoalDTO = { targetAmount: 15000.00 }

      vi.mocked(goalService.updateGoal).mockResolvedValue(mockGoal)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdateGoal(), { wrapper })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalService.updateGoal).toHaveBeenCalledWith('1', updateData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.detail('1') })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.progress() })
    })

    it('should handle update error', async () => {
      const mockError = new Error('Update failed')
      vi.mocked(goalService.updateGoal).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateGoal(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Update Goal')
    })
  })

  describe('useDeleteGoal', () => {
    it('should delete goal successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      vi.mocked(goalService.deleteGoal).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteGoal(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalService.deleteGoal).toHaveBeenCalledWith('1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.lists() })
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: goalKeys.detail('1') })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.progress() })
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed')
      vi.mocked(goalService.deleteGoal).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteGoal(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Delete Goal')
    })
  })

  describe('useContributeToGoal', () => {
    it('should contribute to goal successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockResponse: ContributeToGoalResponseDTO = {
        goal: {
          id: '1',
          userId: 'user-1',
          name: 'Vacation Fund',
          targetAmount: 5000.00,
          currentAmount: 2000.00,
          targetDate: new Date('2024-12-31'),
          priority: 'high' as const,
          status: 'active' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        transaction: {
          id: 'txn-1',
          accountId: 'account-1',
          type: 'transfer' as const,
          amount: 500.00,
          description: 'Goal contribution',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const contributeData: ContributeToGoalDTO = { amount: 500.00, accountId: 'account-1' }

      vi.mocked(goalService.contributeToGoal).mockResolvedValue(mockResponse)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useContributeToGoal(), { wrapper })

      result.current.mutate({ id: '1', data: contributeData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalService.contributeToGoal).toHaveBeenCalledWith('1', contributeData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: goalKeys.detail('1') })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
    })

    it('should handle contribution error', async () => {
      const mockError = new Error('Contribution failed')
      vi.mocked(goalService.contributeToGoal).mockRejectedValue(mockError)

      const { result } = renderHook(() => useContributeToGoal(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} as ContributeToGoalDTO })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Add Contribution')
    })
  })

  describe('useActiveGoals', () => {
    it('should fetch active goals', async () => {
      const mockGoals: GoalDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Active Goal',
          targetAmount: 3000.00,
          currentAmount: 1000.00,
          targetDate: new Date('2024-12-31'),
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(goalService.getActiveGoals).mockResolvedValue(mockGoals)

      const { result } = renderHook(() => useActiveGoals(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockGoals)
      expect(goalService.getActiveGoals).toHaveBeenCalled()
    })
  })

  describe('useGoalProgress', () => {
    it('should fetch goal progress', async () => {
      const mockProgress = {
        totalGoals: 5,
        activeGoals: 3,
        completedGoals: 2,
        totalTargetAmount: 50000.00,
        totalCurrentAmount: 20000.00,
        overallProgress: 40,
      }

      vi.mocked(goalService.getGoalProgress).mockResolvedValue(mockProgress)

      const { result } = renderHook(() => useGoalProgress(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockProgress)
      expect(goalService.getGoalProgress).toHaveBeenCalled()
    })
  })

  describe('goalKeys', () => {
    it('should generate correct query keys', () => {
      expect(goalKeys.all).toEqual(['goals'])
      expect(goalKeys.lists()).toEqual(['goals', 'list'])
      expect(goalKeys.list({ status: 'active' })).toEqual(['goals', 'list', { status: 'active' }])
      expect(goalKeys.details()).toEqual(['goals', 'detail'])
      expect(goalKeys.detail('1')).toEqual(['goals', 'detail', '1'])
      expect(goalKeys.progress()).toEqual(['goals', 'progress'])
    })
  })
})
