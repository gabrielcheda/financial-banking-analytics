/**
 * Tests for Bills Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { billService } from '@/services/api/bills.service'
import { apiClient } from '@/services/api/client'
import type { BillDTO, CreateBillDTO, UpdateBillDTO, PayBillDTO } from '@/types/dto'

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

describe('Bills Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBills', () => {
    it('should get bills without params', async () => {
      const mockBills: BillDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Internet Bill',
          amount: 50.00,
          dueDate: new Date('2024-01-15'),
          isPaid: false,
          isRecurring: true,
          categoryId: 'cat-1',
          categoryName: 'Utilities',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBills })

      const result = await billService.getBills()

      expect(apiClient.get).toHaveBeenCalledWith('/bills')
      expect(result).toEqual(mockBills)
    })

    it('should get bills with filters', async () => {
      const mockBills: BillDTO[] = []
      const params = { isPaid: false, isRecurring: true }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBills })

      const result = await billService.getBills(params)

      expect(apiClient.get).toHaveBeenCalledWith('/bills?isPaid=false&isRecurring=true')
      expect(result).toEqual(mockBills)
    })
  })

  describe('getBillById', () => {
    it('should get bill by id', async () => {
      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Internet Bill',
        amount: 50.00,
        dueDate: new Date('2024-01-15'),
        isPaid: false,
        isRecurring: true,
        categoryId: 'cat-1',
        categoryName: 'Utilities',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBill })

      const result = await billService.getBillById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/bills/1')
      expect(result).toEqual(mockBill)
    })
  })

  describe('createBill', () => {
    it('should create bill successfully', async () => {
      const createData: CreateBillDTO = {
        name: 'Internet Bill',
        amount: 50.00,
        dueDate: new Date('2024-01-15'),
        isRecurring: true,
        categoryId: 'cat-1',
      }

      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Internet Bill',
        amount: 50.00,
        dueDate: new Date('2024-01-15'),
        isPaid: false,
        isRecurring: true,
        categoryId: 'cat-1',
        categoryName: 'Utilities',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockBill })

      const result = await billService.createBill(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/bills', createData)
      expect(result).toEqual(mockBill)
    })
  })

  describe('updateBill', () => {
    it('should update bill successfully', async () => {
      const updateData: UpdateBillDTO = {
        amount: 60.00,
      }

      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Internet Bill',
        amount: 60.00,
        dueDate: new Date('2024-01-15'),
        isPaid: false,
        isRecurring: true,
        categoryId: 'cat-1',
        categoryName: 'Utilities',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockBill })

      const result = await billService.updateBill('1', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/bills/1', updateData)
      expect(result).toEqual(mockBill)
    })
  })

  describe('deleteBill', () => {
    it('should delete bill successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await billService.deleteBill('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/bills/1')
    })
  })

  describe('payBill', () => {
    it('should mark bill as paid', async () => {
      const payData: PayBillDTO = {
        accountId: 'acc-1',
        paidAt: new Date(),
      }

      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Internet Bill',
        amount: 50.00,
        dueDate: new Date('2024-01-15'),
        isPaid: true,
        paidAt: new Date(),
        isRecurring: true,
        categoryId: 'cat-1',
        categoryName: 'Utilities',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockBill })

      const result = await billService.payBill('1', payData)

      expect(apiClient.post).toHaveBeenCalledWith('/bills/1/pay', payData)
      expect(result).toEqual(mockBill)
    })
  })

  describe('getUpcomingBills', () => {
    it('should get upcoming bills with default days', async () => {
      const mockBills: BillDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Internet Bill',
          amount: 50.00,
          dueDate: new Date('2024-01-15'),
          isPaid: false,
          isRecurring: true,
          categoryId: 'cat-1',
          categoryName: 'Utilities',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBills })

      const result = await billService.getUpcomingBills()

      expect(apiClient.get).toHaveBeenCalledWith('/bills/upcoming?days=30')
      expect(result).toEqual(mockBills)
    })

    it('should get upcoming bills with custom days', async () => {
      const mockBills: BillDTO[] = []

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBills })

      const result = await billService.getUpcomingBills(7)

      expect(apiClient.get).toHaveBeenCalledWith('/bills/upcoming?days=7')
      expect(result).toEqual(mockBills)
    })
  })

  describe('getOverdueBills', () => {
    it('should get overdue bills', async () => {
      const mockBills: BillDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Internet Bill',
          amount: 50.00,
          dueDate: new Date('2024-01-01'),
          isPaid: false,
          isRecurring: false,
          categoryId: 'cat-1',
          categoryName: 'Utilities',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBills })

      const result = await billService.getOverdueBills()

      expect(apiClient.get).toHaveBeenCalledWith('/bills/overdue')
      expect(result).toEqual(mockBills)
    })
  })
})
