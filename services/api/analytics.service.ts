/**
 * Analytics Service
 *
 * Service for analytics and insights
 */

import { apiClient, unwrapResponse } from './client'
import type {
  AnalyticsOverviewDTO,
  TrendsAnalysisDTO,
  CashFlowDTO,
  CategorySpendingDTO,
  ApiResponse,
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

    const response = await apiClient.get<ApiResponse<AnalyticsOverviewDTO>>(
      `${this.baseUrl}/overview?${queryParams.toString()}`
    )

    return unwrapResponse(response)
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

    const response = await apiClient.get<ApiResponse<TrendsAnalysisDTO>>(
      `${this.baseUrl}/trends?${queryParams.toString()}`
    )
    return unwrapResponse(response)
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

    const response = await apiClient.get<ApiResponse<TrendsAnalysisDTO>>(
      `${this.baseUrl}/trends?${queryParams.toString()}`
    )
    return unwrapResponse(response)
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

    const response = await apiClient.get<ApiResponse<CategorySpendingDTO[]>>(
      `${this.baseUrl}/spending-by-category?${queryParams.toString()}`
    )
    return unwrapResponse(response)
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

    const response = await apiClient.get<ApiResponse<Array<{ date: string; value: number }>>>(
      `${this.baseUrl}/net-worth?${queryParams.toString()}`
    )
    return unwrapResponse(response)
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
