/**
 * Tests for Analytics Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analyticsService } from '@/services/api/analytics.service'
import { apiClient } from '@/services/api/client'
import type { AnalyticsOverviewDTO, TrendsAnalysisDTO, CashFlowDTO, CategorySpendingDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
  unwrapResponse: vi.fn((response) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }),
}))

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOverview', () => {
    it('should get analytics overview', async () => {
      const mockOverview: AnalyticsOverviewDTO = {
        totalIncome: 10000.00,
        totalExpense: 7000.00,
        netIncome: 3000.00,
        savingsRate: 30,
        topCategory: 'Food',
        transactionCount: 150,
        accountsCount: 3,
      }

      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockOverview })

      const result = await analyticsService.getOverview(params)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockOverview)
    })

    it('should get analytics overview with account filter', async () => {
      const mockOverview: AnalyticsOverviewDTO = {
        totalIncome: 5000.00,
        totalExpense: 3000.00,
        netIncome: 2000.00,
        savingsRate: 40,
        topCategory: 'Salary',
        transactionCount: 50,
        accountsCount: 1,
      }

      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        accountId: 'acc-1',
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockOverview })

      const result = await analyticsService.getOverview(params)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockOverview)
    })
  })

  describe('getSpendingTrends', () => {
    it('should get spending trends', async () => {
      const mockTrends: TrendsAnalysisDTO = {
        period: 'monthly' as const,
        data: [
          { date: '2024-01', value: 3000.00, change: 0 },
          { date: '2024-02', value: 3500.00, change: 16.67 },
        ],
        average: 3250.00,
        trend: 'increasing' as const,
      }

      const params = {
        startDate: '2024-01-01',
        endDate: '2024-02-29',
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTrends })

      const result = await analyticsService.getSpendingTrends(params)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockTrends)
    })
  })

  describe('getIncomeTrends', () => {
    it('should get income trends', async () => {
      const mockTrends: TrendsAnalysisDTO = {
        period: 'monthly' as const,
        data: [
          { date: '2024-01', value: 5000.00, change: 0 },
          { date: '2024-02', value: 5500.00, change: 10 },
        ],
        average: 5250.00,
        trend: 'increasing' as const,
      }

      const params = {
        startDate: '2024-01-01',
        endDate: '2024-02-29',
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTrends })

      const result = await analyticsService.getIncomeTrends(params)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockTrends)
    })
  })
})
