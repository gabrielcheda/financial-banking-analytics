/**
 * Account Service
 *
 * Service for managing financial accounts
 */

import { apiClient, unwrapResponse } from './client'
import type {
  AccountDTO,
  AccountDetailsDTO,
  CreateAccountDTO,
  UpdateAccountDTO,
  AccountSummaryDTO,
  ApiResponse,
} from '@/types/dto'

class AccountService {
  private baseUrl = '/accounts'

  /**
   * List all accounts with pagination
   */
  async getAccounts(params?: {
    page?: number
    limit?: number
    type?: string
    isActive?: boolean
  }): Promise<AccountDTO[]> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    const url = `${this.baseUrl}${query ? `?${query}` : ''}`

    const response = await apiClient.get<ApiResponse<AccountDTO[]>>(url)
    return unwrapResponse(response)
  }

  /**
   * Get account by ID with details
   */
  async getAccountById(id: string): Promise<AccountDetailsDTO> {
    const response = await apiClient.get<ApiResponse<AccountDetailsDTO>>(`${this.baseUrl}/${id}`)
    return unwrapResponse(response)
  }

  /**
   * Create a new account
   */
  async createAccount(data: CreateAccountDTO): Promise<AccountDTO> {
    const response = await apiClient.post<ApiResponse<AccountDTO>>(this.baseUrl, data)
    return unwrapResponse(response)
  }

  /**
   * Update an existing account
   */
  async updateAccount(id: string, data: UpdateAccountDTO): Promise<AccountDTO> {
    const response = await apiClient.patch<ApiResponse<AccountDTO>>(`${this.baseUrl}/${id}`, data)
    return unwrapResponse(response)
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string, transferToAccountId?: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${id}`, {
      params: transferToAccountId ? { transferTo: transferToAccountId } : undefined,
      data: transferToAccountId
        ? {
            transferTo: transferToAccountId,
            transferToAccountId,
          }
        : undefined,
    })
  }

  /**
   * Get total balance from all active accounts
   */
  async getTotalBalance(): Promise<{ totalBalance: number }> {
    const response = await apiClient.get<ApiResponse<{ totalBalance: number }>>(
      `${this.baseUrl}/stats/total-balance`
    )
    return unwrapResponse(response)
  }

  /**
   * Get account summary statistics
   */
  async getAccountSummary(): Promise<AccountSummaryDTO> {
    const response = await apiClient.get<ApiResponse<AccountSummaryDTO>>(
      `${this.baseUrl}/stats/summary`
    )
    return unwrapResponse(response)
  }

  /**
   * Get all active accounts
   */
  async getActiveAccounts(): Promise<AccountDTO[]> {
    return await this.getAccounts({ isActive: true })
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(type: 'checking' | 'savings' | 'credit' | 'investment'): Promise<AccountDTO[]> {
    return await this.getAccounts({ type })
  }
}

// Export singleton instance
export const accountService = new AccountService()
