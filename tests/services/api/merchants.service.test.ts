/**
 * Tests for Merchants Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { merchantService } from '@/services/api/merchants.service'
import { apiClient } from '@/services/api/client'
import type { MerchantDTO, CreateMerchantDTO, UpdateMerchantDTO, MerchantDetailStatsDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Merchants Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMerchants', () => {
    it('should get all merchants', async () => {
      const mockMerchants: MerchantDTO[] = [
        {
          id: '1',
          name: 'Amazon',
          category: 'Shopping',
          logo: 'https://example.com/amazon-logo.png',
          userId: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: mockMerchants })

      const result = await merchantService.getMerchants()

      expect(apiClient.get).toHaveBeenCalledWith('/merchants')
      expect(result).toEqual(mockMerchants)
    })
  })

  describe('getMerchantById', () => {
    it('should get merchant by id', async () => {
      const mockMerchant: MerchantDTO = {
        id: '1',
        name: 'Amazon',
        category: 'Shopping',
        logo: 'https://example.com/amazon-logo.png',
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: mockMerchant })

      const result = await merchantService.getMerchantById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/merchants/1')
      expect(result).toEqual(mockMerchant)
    })
  })

  describe('createMerchant', () => {
    it('should create merchant successfully', async () => {
      const createData: CreateMerchantDTO = {
        name: 'Starbucks',
        category: 'Coffee',
        logo: 'https://example.com/starbucks-logo.png',
      }

      const mockMerchant: MerchantDTO = {
        id: '1',
        name: 'Starbucks',
        category: 'Coffee',
        logo: 'https://example.com/starbucks-logo.png',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: mockMerchant })

      const result = await merchantService.createMerchant(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/merchants', createData)
      expect(result).toEqual(mockMerchant)
    })
  })

  describe('updateMerchant', () => {
    it('should update merchant successfully', async () => {
      const updateData: UpdateMerchantDTO = {
        category: 'Coffee Shop',
      }

      const mockMerchant: MerchantDTO = {
        id: '1',
        name: 'Starbucks',
        category: 'Coffee Shop',
        logo: 'https://example.com/starbucks-logo.png',
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.patch).mockResolvedValue({ success: true, data: mockMerchant })

      const result = await merchantService.updateMerchant('1', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/merchants/1', updateData)
      expect(result).toEqual(mockMerchant)
    })
  })

  describe('deleteMerchant', () => {
    it('should delete merchant successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await merchantService.deleteMerchant('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/merchants/1')
    })
  })

  describe('getMerchantStats', () => {
    it('should get merchant statistics', async () => {
      const mockStats: MerchantDetailStatsDTO = {
        merchantId: '1',
        merchantName: 'Amazon',
        totalSpent: 1500.00,
        transactionCount: 25,
        averageTransaction: 60.00,
        lastTransactionDate: new Date('2024-01-15'),
        monthlyTrend: [
          { month: '2024-01', amount: 500.00, count: 10 },
          { month: '2024-02', amount: 1000.00, count: 15 },
        ],
      }

      vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: mockStats })

      const result = await merchantService.getMerchantStats('1')

      expect(apiClient.get).toHaveBeenCalledWith('/merchants/1/stats')
      expect(result).toEqual(mockStats)
    })
  })
})
