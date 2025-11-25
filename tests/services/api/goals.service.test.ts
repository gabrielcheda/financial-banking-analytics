/**
 * Tests for Goals Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { goalService } from '@/services/api/goals.service'
import { apiClient } from '@/services/api/client'
import type { GoalDTO, CreateGoalDTO, UpdateGoalDTO, ContributeToGoalDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  unwrapResponse: vi.fn((response) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }),
}))

describe('Goals Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGoals', () => {
    it('should get goals with paginated response', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            userId: 'user-1',
            name: 'Emergency Fund',
            targetAmount: 10000.00,
            currentAmount: 5000.00,
            deadline: new Date('2024-12-31'),
            status: 'active' as const,
            priority: 'high' as const,
            progress: 50,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'test-123',
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await goalService.getGoals()

      expect(apiClient.get).toHaveBeenCalledWith('/goals')
      expect(result).toEqual(mockResponse)
    })

    it('should get goals with filters', async () => {
      const params = { status: 'active' as const, priority: 'high' as const }

      const mockResponse = {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'test-123',
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await goalService.getGoals(params)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getGoalById', () => {
    it('should get goal by id', async () => {
      const mockGoal: GoalDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Emergency Fund',
        targetAmount: 10000.00,
        currentAmount: 5000.00,
        deadline: new Date('2024-12-31'),
        status: 'active' as const,
        priority: 'high' as const,
        progress: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockGoal })

      const result = await goalService.getGoalById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/goals/1')
      expect(result).toEqual(mockGoal)
    })
  })

  describe('createGoal', () => {
    it('should create goal successfully', async () => {
      const createData: CreateGoalDTO = {
        name: 'Vacation Fund',
        targetAmount: 5000.00,
        deadline: new Date('2024-06-30'),
        priority: 'medium' as const,
      }

      const mockGoal: GoalDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Vacation Fund',
        targetAmount: 5000.00,
        currentAmount: 0,
        deadline: new Date('2024-06-30'),
        status: 'active' as const,
        priority: 'medium' as const,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockGoal })

      const result = await goalService.createGoal(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/goals', createData)
      expect(result).toEqual(mockGoal)
    })
  })

  describe('updateGoal', () => {
    it('should update goal successfully', async () => {
      const updateData: UpdateGoalDTO = {
        targetAmount: 6000.00,
      }

      const mockGoal: GoalDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Vacation Fund',
        targetAmount: 6000.00,
        currentAmount: 1000.00,
        deadline: new Date('2024-06-30'),
        status: 'active' as const,
        priority: 'medium' as const,
        progress: 16.67,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.put).mockResolvedValue({ data: mockGoal })

      const result = await goalService.updateGoal('1', updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/goals/1', updateData)
      expect(result).toEqual(mockGoal)
    })
  })

  describe('deleteGoal', () => {
    it('should delete goal successfully', async () => {
      const mockResponse = { message: 'Goal deleted successfully' }

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse })

      const result = await goalService.deleteGoal('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/goals/1')
      expect(result).toEqual(mockResponse)
    })
  })
})
