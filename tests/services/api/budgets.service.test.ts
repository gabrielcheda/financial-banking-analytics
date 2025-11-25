/**
 * Tests for Budgets Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { budgetService } from '@/services/api/budgets.service'
import { apiClient } from '@/services/api/client'
import type { BudgetDTO, CreateBudgetDTO, UpdateBudgetDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  unwrapResponse: vi.fn((response) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }),
}))

describe('Budgets Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBudgets', () => {
    it('should get budgets without params', async () => {
      const mockBudgets: BudgetDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          categoryId: 'cat-1',
          categoryName: 'Food',
          amount: 500.00,
          period: 'monthly' as const,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          spent: 200.00,
          remaining: 300.00,
          percentageUsed: 40,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBudgets })

      const result = await budgetService.getBudgets()

      expect(apiClient.get).toHaveBeenCalledWith('/budgets')
      expect(result).toEqual(mockBudgets)
    })

    it('should get budgets with filters', async () => {
      const mockBudgets: BudgetDTO[] = []
      const params = { period: 'monthly' as const, categoryId: 'cat-1' }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBudgets })

      const result = await budgetService.getBudgets(params)

      expect(apiClient.get).toHaveBeenCalledWith('/budgets?period=monthly&categoryId=cat-1')
      expect(result).toEqual(mockBudgets)
    })
  })

  describe('getBudgetById', () => {
    it('should get budget by id', async () => {
      const mockBudget: BudgetDTO = {
        id: '1',
        userId: 'user-1',
        categoryId: 'cat-1',
        categoryName: 'Food',
        amount: 500.00,
        period: 'monthly' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        spent: 200.00,
        remaining: 300.00,
        percentageUsed: 40,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBudget })

      const result = await budgetService.getBudgetById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/budgets/1')
      expect(result).toEqual(mockBudget)
    })
  })

  describe('createBudget', () => {
    it('should create budget successfully', async () => {
      const createData: CreateBudgetDTO = {
        categoryId: 'cat-1',
        amount: 500.00,
        period: 'monthly' as const,
        startDate: new Date('2024-01-01'),
      }

      const mockBudget: BudgetDTO = {
        id: '1',
        userId: 'user-1',
        categoryId: 'cat-1',
        categoryName: 'Food',
        amount: 500.00,
        period: 'monthly' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        spent: 0,
        remaining: 500.00,
        percentageUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockBudget })

      const result = await budgetService.createBudget(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/budgets', createData)
      expect(result).toEqual(mockBudget)
    })
  })

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const updateData: UpdateBudgetDTO = {
        amount: 600.00,
      }

      const mockBudget: BudgetDTO = {
        id: '1',
        userId: 'user-1',
        categoryId: 'cat-1',
        categoryName: 'Food',
        amount: 600.00,
        period: 'monthly' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        spent: 200.00,
        remaining: 400.00,
        percentageUsed: 33.33,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockBudget })

      const result = await budgetService.updateBudget('1', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/budgets/1', updateData)
      expect(result).toEqual(mockBudget)
    })
  })

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await budgetService.deleteBudget('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/budgets/1')
    })
  })

  describe('getCurrentPeriodBudgets', () => {
    it('should get current period budgets', async () => {
      const mockBudgets: BudgetDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          categoryId: 'cat-1',
          categoryName: 'Food',
          amount: 500.00,
          period: 'monthly' as const,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          spent: 200.00,
          remaining: 300.00,
          percentageUsed: 40,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBudgets })

      const result = await budgetService.getCurrentPeriodBudgets()

      expect(apiClient.get).toHaveBeenCalledWith('/budgets/current-period')
      expect(result).toEqual(mockBudgets)
    })
  })

  describe('getBudgetAlerts', () => {
    it('should get budget alerts', async () => {
      const mockAlerts = [
        {
          budget: {
            id: '1',
            userId: 'user-1',
            categoryId: 'cat-1',
            categoryName: 'Food',
            amount: 500.00,
            period: 'monthly' as const,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            spent: 450.00,
            remaining: 50.00,
            percentageUsed: 90,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          spent: 450.00,
          remaining: 50.00,
          percentageUsed: 90,
          isOverBudget: false,
          alertLevel: 'warning' as const,
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAlerts })

      const result = await budgetService.getBudgetAlerts()

      expect(apiClient.get).toHaveBeenCalledWith('/budgets/alerts')
      expect(result).toEqual(mockAlerts)
    })
  })
})
