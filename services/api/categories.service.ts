/**
 * Category Service
 *
 * Service for managing transaction categories
 */

import { apiClient } from './client'
import type {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategorySpendingDTO,
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
    return apiClient.get<CategoryDTO[]>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    )
  }

  /**
   * Get default categories
   */
  async getDefaultCategories(): Promise<CategoryDTO[]> {
    return apiClient.get<CategoryDTO[]>(`${this.baseUrl}/defaults`)
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<CategoryDTO> {
    return apiClient.get<CategoryDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDTO): Promise<CategoryDTO> {
    return apiClient.post<CategoryDTO>(this.baseUrl, data)
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
    return apiClient.patch<CategoryDTO>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Delete a category and reassign transactions
   */
  async deleteCategory(id: string, reassignTo: string): Promise<{ message: string; transactionsReassigned: number }> {
    const params = new URLSearchParams()
    params.append('reassignTo', reassignTo)
    return apiClient.delete<{ message: string; transactionsReassigned: number }>(
      `${this.baseUrl}/${id}?${params.toString()}`
    )
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
