/**
 * Analytics Service
 *
 * Service for analytics and insights
 */

import { apiClient } from './client'
import type {
  AnalyticsOverviewDTO,
  TrendsAnalysisDTO,
  CashFlowDTO,
  CategorySpendingDTO,
} from '@/types/dto'

class AnalyticsService {
  private baseUrl = '/analytics'

  /**
   * Get analytics overview
   */
  async getOverview(params: {
    startDate: string
    endDate: string
    accountId?: string
  }): Promise<AnalyticsOverviewDTO> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.accountId && { accountId: params.accountId }),
    })

    const response = await apiClient.get<AnalyticsOverviewDTO>(
      `${this.baseUrl}/overview?${queryParams.toString()}`
    )

    console.log(`response overview`, response);

    return (response as any).data;
  }

  /**
   * Get spending trends analysis
   */
  async getSpendingTrends(params: {
    startDate: string
    endDate: string
    categoryId?: string
  }): Promise<TrendsAnalysisDTO> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      metric: 'spending',
      ...(params.categoryId && { categoryId: params.categoryId }),
    })

    return apiClient.get<TrendsAnalysisDTO>(
      `${this.baseUrl}/trends?${queryParams.toString()}`
    )
  }

  /**
   * Get income trends analysis
   */
  async getIncomeTrends(params: {
    startDate: string
    endDate: string
  }): Promise<TrendsAnalysisDTO> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      metric: 'income',
    })

    return apiClient.get<TrendsAnalysisDTO>(
      `${this.baseUrl}/trends?${queryParams.toString()}`
    )
  }

  /**
   * Get cash flow data
   * Note: Cash flow data is now part of the overview endpoint response
   */
  async getCashFlow(params: {
    startDate: string
    endDate: string
    interval?: 'daily' | 'weekly' | 'monthly'
  }): Promise<CashFlowDTO[]> {
    const overview = await this.getOverview({
      startDate: params.startDate,
      endDate: params.endDate,
    })

    return overview.cashFlow || []
  }

  /**
   * Get spending by category
   */
  async getSpendingByCategory(params: {
    startDate: string
    endDate: string
    limit?: number
  }): Promise<CategorySpendingDTO[]> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.limit && { limit: String(params.limit) }),
    })

    return apiClient.get<CategorySpendingDTO[]>(
      `${this.baseUrl}/spending-by-category?${queryParams.toString()}`
    )
  }

  /**
   * Get net worth over time
   */
  async getNetWorthHistory(params: {
    startDate: string
    endDate: string
    interval?: 'daily' | 'weekly' | 'monthly'
  }): Promise<Array<{ date: string; value: number }>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      interval: params.interval || 'monthly',
    })

    return apiClient.get<Array<{ date: string; value: number }>>(
      `${this.baseUrl}/net-worth?${queryParams.toString()}`
    )
  }

  /**
   * Get current month analytics
   */
  async getCurrentMonthOverview(): Promise<AnalyticsOverviewDTO> {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    return this.getOverview({ startDate, endDate })
  }

  /**
   * Get year-to-date analytics
   */
  async getYearToDateOverview(): Promise<AnalyticsOverviewDTO> {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString()
    const endDate = now.toISOString()

    return this.getOverview({ startDate, endDate })
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
