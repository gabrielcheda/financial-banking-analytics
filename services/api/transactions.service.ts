/**
 * Transaction Service
 *
 * Serviço para gerenciar transações financeiras
 */

import { apiClient } from './client'
import type {
  TransactionDTO,
  TransactionDetailsDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFiltersDTO,
  TransactionStatsDTO,
  ImportTransactionsDTO,
  ImportResultDTO,
  PaginatedResponse,
  ApiResponse,
} from '@/types/dto'

class TransactionService {
  private baseUrl = '/transactions'

  /**
   * Lista todas as transações com paginação e filtros
   */
  async getTransactions(
    filters: TransactionFiltersDTO = {}
  ): Promise<{ data: TransactionDTO[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const params = new URLSearchParams()

    // Adicionar filtros como query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      }
    })

    return apiClient.get(`${this.baseUrl}?${params.toString()}`)
  }

  /**
   * Busca uma transação específica por ID
   */
  async getTransactionById(id: string): Promise<TransactionDetailsDTO> {
    return apiClient.get<TransactionDetailsDTO>(`${this.baseUrl}/${id}`)
  }

  /**
   * Cria uma nova transação
   */
  async createTransaction(
    data: CreateTransactionDTO
  ): Promise<TransactionDTO> {
    return apiClient.post<TransactionDTO>(this.baseUrl, data)
  }

  /**
   * Atualiza uma transação existente
   */
  async updateTransaction(
    id: string,
    data: UpdateTransactionDTO
  ): Promise<TransactionDTO> {
    return apiClient.patch<TransactionDTO>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Deleta uma transação
   */
  async deleteTransaction(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Busca transações por texto
   */
  async searchTransactions(query: string): Promise<TransactionDTO[]> {
    const params = new URLSearchParams({ q: query })
    return apiClient.get<TransactionDTO[]>(`${this.baseUrl}/search?${params.toString()}`)
  }

  /**
   * Obtém estatísticas mensais
   */
  async getMonthlyStats(
    year: number,
    month: number
  ): Promise<{
    totalIncome: number
    totalExpense: number
    netIncome: number
    transactionCount: number
    byCategory: {
      categoryId: string
      categoryName: string
      total: number
      count: number
    }[]
    byDay: {
      day: number
      income: number
      expense: number
    }[]
  }> {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    })

    return apiClient.get(`${this.baseUrl}/stats/monthly?${params.toString()}`)
  }

  /**
   * Importa transações de arquivo CSV
   */
  async importTransactions(file: File): Promise<{
    imported: number
    failed: number
    errors: string[]
  }> {
    return apiClient.upload<{
      imported: number
      failed: number
      errors: string[]
    }>(`${this.baseUrl}/import/csv`, file)
  }

  /**
   * Exporta transações para CSV
   */
  async exportTransactions(
    filters: TransactionFiltersDTO
  ): Promise<Blob> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      }
    })

    return apiClient.post<Blob>(`${this.baseUrl}/export/csv`, filters, {
      responseType: 'blob'
    })
  }

  /**
   * Obtém transações recentes (últimas 10)
   */
  async getRecentTransactions(accountId?: string): Promise<TransactionDTO[]> {
    const filters: TransactionFiltersDTO = {
      limit: 10,
      sortBy: 'date',
      sortOrder: 'DESC',
      ...(accountId && { accountId }),
    }

    const response = await this.getTransactions(filters)
    return response.data
  }

  /**
   * Obtém transações por período
   */
  async getTransactionsByPeriod(
    period: 'today' | 'week' | 'month' | 'year',
    accountId?: string
  ): Promise<TransactionDTO[]> {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    const filters: TransactionFiltersDTO = {
      dateFrom: startDate.toISOString(),
      dateTo: new Date().toISOString(),
      ...(accountId && { accountId }),
    }

    const response = await this.getTransactions(filters)
    return response.data
  }
}

// Export singleton instance
export const transactionService = new TransactionService()
