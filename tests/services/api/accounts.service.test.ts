/**
 * Tests for Accounts Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { accountService } from '@/services/api/accounts.service'
import { apiClient } from '@/services/api/client'
import type { AccountDTO, CreateAccountDTO, UpdateAccountDTO, AccountSummaryDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  unwrapResponse: vi.fn((response) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }),
}))

describe('Accounts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAccounts', () => {
    it('should get all accounts without filters', async () => {
      const mockAccounts: AccountDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Checking Account',
          type: 'checking' as const,
          balance: 1000.00,
          currency: 'USD',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAccounts })

      const result = await accountService.getAccounts()

      expect(apiClient.get).toHaveBeenCalledWith('/accounts')
      expect(result).toEqual(mockAccounts)
    })

    it('should get accounts with filters', async () => {
      const mockAccounts: AccountDTO[] = []
      const params = { type: 'savings', isActive: true }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAccounts })

      const result = await accountService.getAccounts(params)

      expect(apiClient.get).toHaveBeenCalledWith('/accounts?type=savings&isActive=true')
      expect(result).toEqual(mockAccounts)
    })

    it('should handle get accounts error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(accountService.getAccounts()).rejects.toThrow('Fetch failed')
    })
  })

  describe('getAccountById', () => {
    it('should get account by id', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user-1',
        name: 'Savings Account',
        type: 'savings' as const,
        balance: 5000.00,
        currency: 'USD',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        recentTransactions: [],
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAccount })

      const result = await accountService.getAccountById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/1')
      expect(result).toEqual(mockAccount)
    })
  })

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const createData: CreateAccountDTO = {
        name: 'New Account',
        type: 'checking' as const,
        balance: 100.00,
        currency: 'USD',
      }

      const mockAccount: AccountDTO = {
        id: '1',
        userId: 'user-1',
        ...createData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAccount })

      const result = await accountService.createAccount(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/accounts', createData)
      expect(result).toEqual(mockAccount)
    })

    it('should handle create account error', async () => {
      const createData: CreateAccountDTO = {
        name: 'New Account',
        type: 'checking' as const,
        balance: 100.00,
        currency: 'USD',
      }

      const mockError = new Error('Validation error')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(accountService.createAccount(createData)).rejects.toThrow('Validation error')
    })
  })

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const updateData: UpdateAccountDTO = {
        name: 'Updated Account',
      }

      const mockAccount: AccountDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Updated Account',
        type: 'checking' as const,
        balance: 1000.00,
        currency: 'USD',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockAccount })

      const result = await accountService.updateAccount('1', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/accounts/1', updateData)
      expect(result).toEqual(mockAccount)
    })
  })

  describe('deleteAccount', () => {
    it('should delete account without transfer', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await accountService.deleteAccount('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/accounts/1', {
        params: undefined,
        data: undefined,
      })
    })

    it('should delete account with transfer to another account', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await accountService.deleteAccount('1', '2')

      expect(apiClient.delete).toHaveBeenCalledWith('/accounts/1', {
        params: { transferTo: '2' },
        data: { transferTo: '2', transferToAccountId: '2' },
      })
    })
  })

  describe('getTotalBalance', () => {
    it('should get total balance', async () => {
      const mockBalance = { totalBalance: 10000.00 }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBalance })

      const result = await accountService.getTotalBalance()

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/stats/total-balance')
      expect(result).toEqual(mockBalance)
    })
  })

  describe('getAccountSummary', () => {
    it('should get account summary', async () => {
      const mockSummary: AccountSummaryDTO = {
        totalBalance: 15000.00,
        totalAccounts: 3,
        activeAccounts: 2,
        accountsByType: {
          checking: 1,
          savings: 1,
          credit: 1,
          investment: 0,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSummary })

      const result = await accountService.getAccountSummary()

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/stats/summary')
      expect(result).toEqual(mockSummary)
    })
  })

  describe('getAccountBalance', () => {
    it('should get account balance with pending transactions', async () => {
      const mockBalance = {
        accountId: '1',
        balance: 1000.00,
        availableBalance: 900.00,
        pendingBalance: 100.00,
        lastUpdated: new Date().toISOString(),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBalance })

      const result = await accountService.getAccountBalance('1')

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/1/balance')
      expect(result).toEqual(mockBalance)
    })
  })

  describe('getActiveAccounts', () => {
    it('should get only active accounts', async () => {
      const mockAccounts: AccountDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Active Account',
          type: 'checking' as const,
          balance: 1000.00,
          currency: 'USD',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAccounts })

      const result = await accountService.getActiveAccounts()

      expect(apiClient.get).toHaveBeenCalledWith('/accounts?isActive=true')
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('getAccountsByType', () => {
    it('should get accounts by type', async () => {
      const mockAccounts: AccountDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Savings Account',
          type: 'savings' as const,
          balance: 5000.00,
          currency: 'USD',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAccounts })

      const result = await accountService.getAccountsByType('savings')

      expect(apiClient.get).toHaveBeenCalledWith('/accounts?type=savings')
      expect(result).toEqual(mockAccounts)
    })
  })
})
