/**
 * Merchant Service
 *
 * Service for managing merchants (establishments/stores)
 */

import { apiClient } from './client'
import type {
  MerchantDTO,
  CreateMerchantDTO,
  UpdateMerchantDTO,
  MerchantStatsDTO,
  MerchantDetailStatsDTO,
} from '@/types/dto'

class MerchantService {
  private baseUrl = '/merchants'

  /**
   * List all merchants
   */
  async getMerchants(): Promise<MerchantDTO[]> {
    const response = await apiClient.get<{ success: boolean; data: MerchantDTO[] }>(this.baseUrl)
    return response.data
  }

  /**
   * Get merchant by ID
   */
  async getMerchantById(id: string): Promise<MerchantDTO> {
    const response = await apiClient.get<{ success: boolean; data: MerchantDTO }>(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Create a new merchant
   */
  async createMerchant(data: CreateMerchantDTO): Promise<MerchantDTO> {
    const response = await apiClient.post<{ success: boolean; data: MerchantDTO }>(this.baseUrl, data)
    return response.data
  }

  /**
   * Update an existing merchant
   */
  async updateMerchant(id: string, data: UpdateMerchantDTO): Promise<MerchantDTO> {
    const response = await apiClient.patch<{ success: boolean; data: MerchantDTO }>(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  /**
   * Delete a merchant
   */
  async deleteMerchant(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Get merchant statistics
   */
  async getMerchantStats(id: string): Promise<MerchantDetailStatsDTO> {
    const response = await apiClient.get<{ success: boolean; data: MerchantDetailStatsDTO }>(`${this.baseUrl}/${id}/stats`)
    return response.data
  }
}

// Export singleton instance
export const merchantService = new MerchantService()
