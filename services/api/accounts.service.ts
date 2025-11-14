/**
 * Account Service
 *
 * Service for managing financial accounts
 */

import { apiClient } from './client'
import type {
  AccountDTO,
  AccountDetailsDTO,
  CreateAccountDTO,
  UpdateAccountDTO,
  AccountSummaryDTO,
  PaginatedResponse,
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

    return apiClient.get<AccountDTO[]>(url)
  }

  /**
   * Get account by ID with details
   */
  async getAccountById(id: string): Promise<AccountDetailsDTO> {
    return apiClient.get<AccountDetailsDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Create a new account
   */
  async createAccount(data: CreateAccountDTO): Promise<AccountDTO> {
    return await apiClient.post<AccountDTO>(this.baseUrl, data);
  }

  /**
   * Update an existing account
   */
  async updateAccount(id: string, data: UpdateAccountDTO): Promise<AccountDTO> {
    return apiClient.patch<AccountDTO>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Get total balance from all active accounts
   */
  async getTotalBalance(): Promise<{ totalBalance: number }> {
    return apiClient.get<{ totalBalance: number }>(`${this.baseUrl}/stats/total-balance`)
  }

  /**
   * Get account summary statistics
   */
  async getAccountSummary(): Promise<AccountSummaryDTO> {
    return apiClient.get<AccountSummaryDTO>(`${this.baseUrl}/stats/summary`)
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
