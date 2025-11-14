/**
 * Bill Service
 *
 * Service for managing bills and recurring payments
 */

import { apiClient } from './client'
import type {
  BillDTO,
  CreateBillDTO,
  UpdateBillDTO,
  PayBillDTO,
  PayBillResponseDTO,
  PaginatedResponse,
} from '@/types/dto'

class BillService {
  private baseUrl = '/bills'

  /**
   * List all bills
   */
  async getBills(): Promise<BillDTO[]> {
    return apiClient.get<BillDTO[]>(this.baseUrl)
  }

  /**
   * Get bill by ID
   */
  async getBillById(id: string): Promise<BillDTO> {
    return apiClient.get<BillDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Create a new bill
   */
  async createBill(data: CreateBillDTO): Promise<BillDTO> {
    return apiClient.post<BillDTO>(this.baseUrl, data)
  }

  /**
   * Update an existing bill
   */
  async updateBill(id: string, data: UpdateBillDTO): Promise<BillDTO> {
    return apiClient.patch<BillDTO>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Delete a bill
   */
  async deleteBill(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Mark bill as paid
   */
  async payBill(id: string, data: PayBillDTO): Promise<BillDTO> {
    return apiClient.post<BillDTO>(`${this.baseUrl}/${id}/pay`, data)
  }

  /**
   * Get upcoming bills
   */
  async getUpcomingBills(days: number = 30): Promise<BillDTO[]> {
    const params = new URLSearchParams({ days: String(days) })
    return apiClient.get<BillDTO[]>(`${this.baseUrl}/upcoming?${params.toString()}`)
  }

  /**
   * Get overdue bills
   */
  async getOverdueBills(): Promise<BillDTO[]> {
    return apiClient.get<BillDTO[]>(`${this.baseUrl}/overdue`)
  }
}

// Export singleton instance
export const billService = new BillService()
