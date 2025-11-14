/**
 * Budget Service
 *
 * Service for managing budgets
 */

import { apiClient } from './client'
import type {
  BudgetDTO,
  CreateBudgetDTO,
  UpdateBudgetDTO,
  PaginatedResponse,
} from '@/types/dto'

class BudgetService {
  private baseUrl = '/budgets'

  /**
   * List all budgets
   */
  async getBudgets(): Promise<BudgetDTO[]> {
    return apiClient.get<BudgetDTO[]>(this.baseUrl)
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(id: string): Promise<BudgetDTO> {
    return apiClient.get<BudgetDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Create a new budget
   */
  async createBudget(data: CreateBudgetDTO): Promise<BudgetDTO> {
    return apiClient.post<BudgetDTO>(this.baseUrl, data)
  }

  /**
   * Update an existing budget
   */
  async updateBudget(id: string, data: UpdateBudgetDTO): Promise<BudgetDTO> {
    return apiClient.patch<BudgetDTO>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Delete a budget
   */
  async deleteBudget(id: string): Promise<BudgetDTO> {
    return apiClient.delete<BudgetDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Get budgets for current period
   */
  async getCurrentPeriodBudgets(): Promise<BudgetDTO[]> {
    return apiClient.get<BudgetDTO[]>(`${this.baseUrl}/current-period`)
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
    return apiClient.get(`${this.baseUrl}/alerts`)
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
    return apiClient.get(`${this.baseUrl}/${id}/status`)
  }
}

// Export singleton instance
export const budgetService = new BudgetService()
