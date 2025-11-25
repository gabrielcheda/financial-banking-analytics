/**
 * Tests for Transactions Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { transactionService } from '@/services/api/transactions.service'
import { apiClient } from '@/services/api/client'
import type { TransactionDTO, CreateTransactionDTO, UpdateTransactionDTO, TransactionFiltersDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
  unwrapResponse: vi.fn((response) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }),
}))

describe('Transactions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTransactions', () => {
    it('should get transactions without filters', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            accountId: 'acc-1',
            amount: 100.00,
            type: 'income' as const,
            description: 'Salary',
            date: new Date('2024-01-01'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          pageSize: 10,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getTransactions()

      expect(apiClient.get).toHaveBeenCalledWith('/transactions?')
      expect(result).toEqual(mockResponse)
    })

    it('should get transactions with filters', async () => {
      const filters: TransactionFiltersDTO = {
        accountId: 'acc-1',
        type: 'income',
        limit: 20,
      }

      const mockResponse = {
        data: [],
        meta: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 20 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getTransactions(filters)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTransactionById', () => {
    it('should get transaction by id', async () => {
      const mockTransaction = {
        id: '1',
        accountId: 'acc-1',
        amount: 100.00,
        type: 'income' as const,
        description: 'Salary',
        date: new Date('2024-01-01'),
        categoryId: 'cat-1',
        categoryName: 'Salary',
        accountName: 'Checking',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTransaction })

      const result = await transactionService.getTransactionById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/1')
      expect(result).toEqual(mockTransaction)
    })
  })

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const createData: CreateTransactionDTO = {
        accountId: 'acc-1',
        amount: 50.00,
        type: 'expense' as const,
        description: 'Groceries',
        date: new Date('2024-01-01'),
        categoryId: 'cat-1',
      }

      const mockTransaction: TransactionDTO = {
        id: '1',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockTransaction })

      const result = await transactionService.createTransaction(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/transactions', createData)
      expect(result).toEqual(mockTransaction)
    })
  })

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const updateData: UpdateTransactionDTO = {
        amount: 75.00,
        description: 'Updated Groceries',
      }

      const mockTransaction: TransactionDTO = {
        id: '1',
        accountId: 'acc-1',
        amount: 75.00,
        type: 'expense' as const,
        description: 'Updated Groceries',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockTransaction })

      const result = await transactionService.updateTransaction('1', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/transactions/1', updateData)
      expect(result).toEqual(mockTransaction)
    })
  })

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await transactionService.deleteTransaction('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/transactions/1')
    })
  })

  describe('searchTransactions', () => {
    it('should search transactions by query', async () => {
      const mockTransactions: TransactionDTO[] = [
        {
          id: '1',
          accountId: 'acc-1',
          amount: 100.00,
          type: 'income' as const,
          description: 'Salary Payment',
          date: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTransactions })

      const result = await transactionService.searchTransactions('Salary')

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockTransactions)
    })
  })

  describe('getMonthlyStats', () => {
    it('should get monthly statistics', async () => {
      const mockStats = {
        totalIncome: 5000.00,
        totalExpense: 3000.00,
        netIncome: 2000.00,
        transactionCount: 50,
        byCategory: [
          {
            categoryId: 'cat-1',
            categoryName: 'Salary',
            total: 5000.00,
            count: 1,
          },
        ],
        byDay: [
          { day: 1, income: 5000.00, expense: 100.00 },
        ],
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats })

      const result = await transactionService.getMonthlyStats(2024, 1)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockStats)
    })
  })

  describe('importTransactions', () => {
    it('should import transactions from CSV', async () => {
      const mockFile = new File([''], 'transactions.csv', { type: 'text/csv' })
      const mockResult = {
        imported: 10,
        failed: 2,
        errors: ['Row 5: Invalid date', 'Row 8: Missing amount'],
      }

      vi.mocked(apiClient.upload).mockResolvedValue({ data: mockResult })

      const result = await transactionService.importTransactions(mockFile)

      expect(apiClient.upload).toHaveBeenCalledWith('/transactions/import/csv', mockFile)
      expect(result).toEqual(mockResult)
    })
  })

  describe('exportTransactions', () => {
    it('should export transactions to CSV', async () => {
      const filters: TransactionFiltersDTO = {
        accountId: 'acc-1',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      }

      const mockBlob = new Blob(['csv data'], { type: 'text/csv' })

      vi.mocked(apiClient.post).mockResolvedValue(mockBlob)

      const result = await transactionService.exportTransactions(filters)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/transactions/export/csv',
        filters,
        { responseType: 'blob' }
      )
      expect(result).toEqual(mockBlob)
    })
  })

  describe('importCsv', () => {
    it('should import CSV file with FormData', async () => {
      const mockFile = new File([''], 'import.csv', { type: 'text/csv' })
      const mockResult = {
        imported: 15,
        failed: 0,
        errors: [],
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult })

      const result = await transactionService.importCsv(mockFile)

      expect(apiClient.post).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('getRecentTransactions', () => {
    it('should get recent transactions without accountId', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            accountId: 'acc-1',
            amount: 100.00,
            type: 'income' as const,
            description: 'Recent Transaction',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1, pageSize: 10 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getRecentTransactions()

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })

    it('should get recent transactions for specific account', async () => {
      const mockResponse = {
        data: [],
        meta: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getRecentTransactions('acc-1')

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getTransactionsByPeriod', () => {
    it('should get transactions for today', async () => {
      const mockResponse = {
        data: [],
        meta: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getTransactionsByPeriod('today')

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })

    it('should get transactions for last week', async () => {
      const mockResponse = {
        data: [],
        meta: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getTransactionsByPeriod('week', 'acc-1')

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })

    it('should get transactions for last month', async () => {
      const mockResponse = {
        data: [],
        meta: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getTransactionsByPeriod('month')

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })

    it('should get transactions for last year', async () => {
      const mockResponse = {
        data: [],
        meta: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await transactionService.getTransactionsByPeriod('year')

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })
  })
})
