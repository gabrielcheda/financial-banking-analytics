/**
 * Category Service
 *
 * Service for managing transaction categories
 */

import { apiClient, unwrapResponse } from './client'
import type {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  ApiResponse,
} from '@/types/dto'

class CategoryService {
  private baseUrl = '/categories'

  /**
   * List all categories
   */
  async getCategories(params?: {
    type?: 'income' | 'expense'
  }): Promise<CategoryDTO[]> {
    const queryParams = new URLSearchParams()

    if (params?.type) {
      queryParams.append('type', params.type)
    }

    const query = queryParams.toString()
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    )
    return unwrapResponse(response)
  }

  /**
   * Get default categories
   */
  async getDefaultCategories(): Promise<CategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(`${this.baseUrl}/defaults`)
    return unwrapResponse(response)
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<CategoryDTO> {
    const response = await apiClient.get<ApiResponse<CategoryDTO>>(`${this.baseUrl}/${id}`)
    return unwrapResponse(response)
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDTO): Promise<CategoryDTO> {
    const response = await apiClient.post<ApiResponse<CategoryDTO>>(this.baseUrl, data)
    return unwrapResponse(response)
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
    const response = await apiClient.patch<ApiResponse<CategoryDTO>>(`${this.baseUrl}/${id}`, data)
    return unwrapResponse(response)
  }

  /**
   * Delete a category and reassign transactions
   */
  async deleteCategory(id: string, reassignTo: string): Promise<{ message: string; transactionsReassigned: number }> {
    const params = new URLSearchParams()
    params.append('reassignTo', reassignTo)
    const response = await apiClient.delete<ApiResponse<{ message: string; transactionsReassigned: number }>>(
      `${this.baseUrl}/${id}?${params.toString()}`
    )
    return unwrapResponse(response)
  }

  /**
   * Get expense categories
   */
  async getExpenseCategories(): Promise<CategoryDTO[]> {
    return this.getCategories({ type: 'expense' })
  }

  /**
   * Get income categories
   */
  async getIncomeCategories(): Promise<CategoryDTO[]> {
    return this.getCategories({ type: 'income' })
  }
}

// Export singleton instance
export const categoryService = new CategoryService()
