/**
 * Goal Service
 *
 * Service for managing financial goals
 */

import { apiClient, unwrapResponse } from './client'
import type {
  GoalDTO,
  CreateGoalDTO,
  UpdateGoalDTO,
  ContributeToGoalDTO,
  ContributeToGoalResponseDTO,
  PaginatedResponse,
} from '@/types/dto'

const createEmptyPaginatedResponse = (): PaginatedResponse<GoalDTO> => ({
  success: true,
  data: [],
  pagination: {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'local-fallback',
  },
})

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
    const response = await apiClient.get<PaginatedResponse<GoalDTO> | GoalDTO[]>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    )

    if (Array.isArray(response)) {
      const fallback = createEmptyPaginatedResponse()
      return { ...fallback, data: response, pagination: { ...fallback.pagination, limit: response.length, total: response.length, totalPages: 1 } }
    }

    if (response && typeof response === 'object' && 'data' in response) {
      return response as PaginatedResponse<GoalDTO>
    }

    return createEmptyPaginatedResponse()
  }

  /**
   * Get goal by ID
   */
  async getGoalById(id: string): Promise<GoalDTO> {
    const response = await apiClient.get<GoalDTO | { data: GoalDTO }>(`${this.baseUrl}/${id}`)
    return unwrapResponse(response)
  }

  /**
   * Create a new goal
   */
  async createGoal(data: CreateGoalDTO): Promise<GoalDTO> {
    const response = await apiClient.post<GoalDTO | { data: GoalDTO }>(this.baseUrl, data)
    return unwrapResponse(response)
  }

  /**
   * Update an existing goal
   */
  async updateGoal(id: string, data: UpdateGoalDTO): Promise<GoalDTO> {
    const response = await apiClient.put<GoalDTO | { data: GoalDTO }>(`${this.baseUrl}/${id}`, data)
    return unwrapResponse(response)
  }

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string } | { data: { message: string } }>(
      `${this.baseUrl}/${id}`
    )
    return unwrapResponse(response)
  }

  /**
   * Contribute to a goal (creates transaction)
   */
  async contributeToGoal(id: string, data: ContributeToGoalDTO): Promise<ContributeToGoalResponseDTO> {
    const response = await apiClient.post<
      ContributeToGoalResponseDTO | { data: ContributeToGoalResponseDTO }
    >(`${this.baseUrl}/${id}/contribute`, data)
    return unwrapResponse(response)
  }

  /**
   * Get active goals
   */
  async getActiveGoals(): Promise<GoalDTO[]> {
    const response = await this.getGoals({ status: 'active' })
    return response?.data ?? []
  }

  /**
   * Get goals by priority
   */
  async getGoalsByPriority(priority: 'low' | 'medium' | 'high'): Promise<GoalDTO[]> {
    const response = await this.getGoals({ priority })
    return response?.data ?? []
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
