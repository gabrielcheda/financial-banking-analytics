/**
 * Budget Service
 *
 * Service for managing budgets
 */

import { apiClient, unwrapResponse } from './client'
import type {
  BudgetDTO,
  CreateBudgetDTO,
  UpdateBudgetDTO,
  ApiResponse,
} from '@/types/dto'

class BudgetService {
  private baseUrl = '/budgets'

  /**
   * List all budgets
   */
  async getBudgets(params?: {
    page?: number
    limit?: number
    period?: 'monthly' | 'yearly'
    categoryId?: string
  }): Promise<BudgetDTO[]> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    const response = await apiClient.get<ApiResponse<BudgetDTO[]>>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    )
    return unwrapResponse(response)
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(id: string): Promise<BudgetDTO> {
    const response = await apiClient.get<ApiResponse<BudgetDTO>>(`${this.baseUrl}/${id}`)
    return unwrapResponse(response)
  }

  /**
   * Create a new budget
   */
  async createBudget(data: CreateBudgetDTO): Promise<BudgetDTO> {
    const response = await apiClient.post<ApiResponse<BudgetDTO>>(this.baseUrl, data)
    return unwrapResponse(response)
  }

  /**
   * Update an existing budget
   */
  async updateBudget(id: string, data: UpdateBudgetDTO): Promise<BudgetDTO> {
    const response = await apiClient.patch<ApiResponse<BudgetDTO>>(`${this.baseUrl}/${id}`, data)
    return unwrapResponse(response)
  }

  /**
   * Delete a budget
   */
  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Get budgets for current period
   */
  async getCurrentPeriodBudgets(): Promise<BudgetDTO[]> {
    const response = await apiClient.get<ApiResponse<BudgetDTO[]>>(`${this.baseUrl}/current-period`)
    return unwrapResponse(response)
  }

  /**
   * Get budget alerts
   */
  async getBudgetAlerts(): Promise<{
    budget: BudgetDTO
    spent: number
    remaining: number
    percentageUsed: number
    isOverBudget: boolean
    alertLevel: 'warning' | 'danger'
  }[]> {
    const response = await apiClient.get<ApiResponse<{
      budget: BudgetDTO
      spent: number
      remaining: number
      percentageUsed: number
      isOverBudget: boolean
      alertLevel: 'warning' | 'danger'
    }[]>>(`${this.baseUrl}/alerts`)
    return unwrapResponse(response)
  }

  /**
   * Get budget status
   */
  async getBudgetStatus(id: string): Promise<{
    budget: BudgetDTO
    spent: number
    remaining: number
    percentageUsed: number
    isOverBudget: boolean
  }> {
    const response = await apiClient.get<ApiResponse<{
      budget: BudgetDTO
      spent: number
      remaining: number
      percentageUsed: number
      isOverBudget: boolean
    }>>(`${this.baseUrl}/${id}/status`)
    return unwrapResponse(response)
  }
}

// Export singleton instance
export const budgetService = new BudgetService()
