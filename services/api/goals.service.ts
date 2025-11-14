/**
 * Goal Service
 *
 * Service for managing financial goals
 */

import { apiClient } from './client'
import type {
  GoalDTO,
  CreateGoalDTO,
  UpdateGoalDTO,
  ContributeToGoalDTO,
  ContributeToGoalResponseDTO,
  PaginatedResponse,
} from '@/types/dto'

class GoalService {
  private baseUrl = '/goals'

  /**
   * List all goals with pagination
   */
  async getGoals(params?: {
    page?: number
    limit?: number
    status?: 'active' | 'completed' | 'cancelled'
    priority?: 'low' | 'medium' | 'high'
  }): Promise<PaginatedResponse<GoalDTO>> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    return apiClient.get<PaginatedResponse<GoalDTO>>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    )
  }

  /**
   * Get goal by ID
   */
  async getGoalById(id: string): Promise<GoalDTO> {
    return apiClient.get<GoalDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Create a new goal
   */
  async createGoal(data: CreateGoalDTO): Promise<GoalDTO> {
    return apiClient.post<GoalDTO>(this.baseUrl, data)
  }

  /**
   * Update an existing goal
   */
  async updateGoal(id: string, data: UpdateGoalDTO): Promise<GoalDTO> {
    return apiClient.put<GoalDTO>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.baseUrl}/${id}`)
  }

  /**
   * Contribute to a goal (creates transaction)
   */
  async contributeToGoal(id: string, data: ContributeToGoalDTO): Promise<ContributeToGoalResponseDTO> {
    return apiClient.post<ContributeToGoalResponseDTO>(`${this.baseUrl}/${id}/contribute`, data)
  }

  /**
   * Get active goals
   */
  async getActiveGoals(): Promise<GoalDTO[]> {
    const response = await this.getGoals({ status: 'active' })
    return response.data
  }

  /**
   * Get goals by priority
   */
  async getGoalsByPriority(priority: 'low' | 'medium' | 'high'): Promise<GoalDTO[]> {
    const response = await this.getGoals({ priority })
    return response.data
  }

  /**
   * Get goal progress summary
   */
  async getGoalProgress(): Promise<GoalDTO[]> {
    const response = await this.getActiveGoals()
    // Sort by calculated percentage (currentAmount/targetAmount)
    return response.sort((a, b) => {
      const percentageA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) * 100 : 0
      const percentageB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) * 100 : 0
      return percentageB - percentageA
    })
  }
}

// Export singleton instance
export const goalService = new GoalService()
