/**
 * Bill Service
 *
 * Service for managing bills and recurring payments
 */

import { apiClient, unwrapResponse } from './client'
import type {
  BillDTO,
  CreateBillDTO,
  UpdateBillDTO,
  PayBillDTO,
  ApiResponse,
} from '@/types/dto'

class BillService {
  private baseUrl = '/bills'

  /**
   * List all bills
   */
  async getBills(params?: {
    page?: number
    limit?: number
    isPaid?: boolean
    isRecurring?: boolean
    startDate?: string
    endDate?: string
  }): Promise<BillDTO[]> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    const response = await apiClient.get<ApiResponse<BillDTO[]>>(
      `${this.baseUrl}${query ? `?${query}` : ''}`
    )
    return unwrapResponse(response)
  }

  /**
   * Get bill by ID
   */
  async getBillById(id: string): Promise<BillDTO> {
    const response = await apiClient.get<ApiResponse<BillDTO>>(`${this.baseUrl}/${id}`)
    return unwrapResponse(response)
  }

  /**
   * Create a new bill
   */
  async createBill(data: CreateBillDTO): Promise<BillDTO> {
    const response = await apiClient.post<ApiResponse<BillDTO>>(this.baseUrl, data)
    return unwrapResponse(response)
  }

  /**
   * Update an existing bill
   */
  async updateBill(id: string, data: UpdateBillDTO): Promise<BillDTO> {
    const response = await apiClient.patch<ApiResponse<BillDTO>>(`${this.baseUrl}/${id}`, data)
    return unwrapResponse(response)
  }

  /**
   * Delete a bill
   */
  async deleteBill(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Mark bill as paid
   */
  async payBill(id: string, data: PayBillDTO): Promise<BillDTO> {
    const response = await apiClient.post<ApiResponse<BillDTO>>(`${this.baseUrl}/${id}/pay`, data)
    return unwrapResponse(response)
  }

  /**
   * Get upcoming bills
   */
  async getUpcomingBills(days: number = 30): Promise<BillDTO[]> {
    const params = new URLSearchParams({ days: String(days) })
    const response = await apiClient.get<ApiResponse<BillDTO[]>>(
      `${this.baseUrl}/upcoming?${params.toString()}`
    )
    return unwrapResponse(response)
  }

  /**
   * Get overdue bills
   */
  async getOverdueBills(): Promise<BillDTO[]> {
    const response = await apiClient.get<ApiResponse<BillDTO[]>>(`${this.baseUrl}/overdue`)
    return unwrapResponse(response)
  }
}

// Export singleton instance
export const billService = new BillService()
