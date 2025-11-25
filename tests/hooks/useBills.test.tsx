/**
 * Tests for useBills hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as billHooks from '@/hooks/useBills'
import { billService } from '@/services/api/bills.service'
import * as errorUtils from '@/lib/error-utils'
import type { BillDTO, CreateBillDTO, UpdateBillDTO, PayBillDTO, PayBillResponseDTO } from '@/types/dto'

// Mock services
vi.mock('@/services/api/bills.service')
vi.mock('@/lib/error-utils')

const { 
  useBills, 
  useBill, 
  useCreateBill, 
  useUpdateBill, 
  useDeleteBill,
  usePayBill,
  useUpcomingBills,
  useOverdueBills,
  billKeys 
} = billHooks

describe('useBills Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useBills', () => {
    it('should fetch bills with default params', async () => {
      const mockBills: BillDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          name: 'Electricity Bill',
          amount: 150.00,
          dueDate: new Date('2024-02-15'),
          isPaid: false,
          isRecurring: true,
          recurringFrequency: 'monthly' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(billService.getBills).mockResolvedValue(mockBills)

      const { result } = renderHook(() => useBills(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockBills)
      expect(billService.getBills).toHaveBeenCalledWith(undefined)
    })

    it('should fetch bills with filters', async () => {
      const mockBills: BillDTO[] = []
      const params = { isPaid: false, isRecurring: true }
      vi.mocked(billService.getBills).mockResolvedValue(mockBills)

      const { result } = renderHook(() => useBills(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(billService.getBills).toHaveBeenCalledWith(params)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(billService.getBills).mockRejectedValue(mockError)

      const { result } = renderHook(() => useBills(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useBill', () => {
    it('should fetch bill by id', async () => {
      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        accountId: 'account-1',
        categoryId: 'category-1',
        name: 'Rent',
        amount: 1200.00,
        dueDate: new Date('2024-03-01'),
        isPaid: false,
        isRecurring: true,
        recurringFrequency: 'monthly' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(billService.getBillById).mockResolvedValue(mockBill)

      const { result } = renderHook(() => useBill('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockBill)
      expect(billService.getBillById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useBill(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(billService.getBillById).not.toHaveBeenCalled()
    })
  })

  describe('useCreateBill', () => {
    it('should create bill successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        accountId: 'account-1',
        categoryId: 'category-1',
        name: 'New Bill',
        amount: 100.00,
        dueDate: new Date('2024-03-15'),
        isPaid: false,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const billData: CreateBillDTO = {
        accountId: 'account-1',
        categoryId: 'category-1',
        name: 'New Bill',
        amount: 100.00,
        dueDate: new Date('2024-03-15'),
        isPaid: false,
      }

      vi.mocked(billService.createBill).mockResolvedValue(mockBill)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateBill(), { wrapper })

      result.current.mutate(billData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(billService.createBill).toHaveBeenCalledWith(billData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: billKeys.all })
    })

    it('should handle create error', async () => {
      const mockError = new Error('Create failed')
      vi.mocked(billService.createBill).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateBill(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({} as CreateBillDTO)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Create Bill')
    })
  })

  describe('useUpdateBill', () => {
    it('should update bill successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockBill: BillDTO = {
        id: '1',
        userId: 'user-1',
        accountId: 'account-1',
        categoryId: 'category-1',
        name: 'Updated Bill',
        amount: 200.00,
        dueDate: new Date('2024-03-20'),
        isPaid: false,
        isRecurring: true,
        recurringFrequency: 'monthly' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const updateData: UpdateBillDTO = { name: 'Updated Bill', amount: 200.00 }

      vi.mocked(billService.updateBill).mockResolvedValue(mockBill)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdateBill(), { wrapper })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(billService.updateBill).toHaveBeenCalledWith('1', updateData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: billKeys.detail('1') })
    })

    it('should handle update error', async () => {
      const mockError = new Error('Update failed')
      vi.mocked(billService.updateBill).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateBill(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Update Bill')
    })
  })

  describe('useDeleteBill', () => {
    it('should delete bill successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      vi.mocked(billService.deleteBill).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteBill(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(billService.deleteBill).toHaveBeenCalledWith('1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: billKeys.all })
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: billKeys.detail('1') })
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed')
      vi.mocked(billService.deleteBill).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteBill(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Delete Bill')
    })
  })

  describe('usePayBill', () => {
    it('should pay bill successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockResponse: PayBillResponseDTO = {
        bill: {
          id: '1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          name: 'Paid Bill',
          amount: 150.00,
          dueDate: new Date('2024-02-15'),
          isPaid: true,
          isRecurring: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        transaction: {
          id: 'txn-1',
          accountId: 'account-1',
          type: 'expense' as const,
          amount: 150.00,
          description: 'Bill payment',
          date: new Date('2024-02-15'),
          categoryId: 'category-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const payData: PayBillDTO = { paidDate: new Date('2024-02-15'), accountId: 'account-1' }

      vi.mocked(billService.payBill).mockResolvedValue(mockResponse)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => usePayBill(), { wrapper })

      result.current.mutate({ id: '1', data: payData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(billService.payBill).toHaveBeenCalledWith('1', payData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: billKeys.all })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
    })

    it('should handle payment error', async () => {
      const mockError = new Error('Payment failed')
      vi.mocked(billService.payBill).mockRejectedValue(mockError)

      const { result } = renderHook(() => usePayBill(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} as PayBillDTO })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Pay Bill')
    })
  })

  describe('useUpcomingBills', () => {
    it('should fetch upcoming bills with default days', async () => {
      const mockBills: BillDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          name: 'Upcoming Bill',
          amount: 100.00,
          dueDate: new Date('2024-02-20'),
          isPaid: false,
          isRecurring: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(billService.getUpcomingBills).mockResolvedValue(mockBills)

      const { result } = renderHook(() => useUpcomingBills(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockBills)
      expect(billService.getUpcomingBills).toHaveBeenCalledWith(7)
    })

    it('should fetch upcoming bills with custom days', async () => {
      const mockBills: BillDTO[] = []
      vi.mocked(billService.getUpcomingBills).mockResolvedValue(mockBills)

      const { result } = renderHook(() => useUpcomingBills(30), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(billService.getUpcomingBills).toHaveBeenCalledWith(30)
    })
  })

  describe('useOverdueBills', () => {
    it('should fetch overdue bills', async () => {
      const mockBills: BillDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          name: 'Overdue Bill',
          amount: 50.00,
          dueDate: new Date('2024-01-15'),
          isPaid: false,
          isRecurring: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(billService.getOverdueBills).mockResolvedValue(mockBills)

      const { result } = renderHook(() => useOverdueBills(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockBills)
      expect(billService.getOverdueBills).toHaveBeenCalled()
    })
  })

  describe('billKeys', () => {
    it('should generate correct query keys', () => {
      expect(billKeys.all).toEqual(['bills'])
      expect(billKeys.lists()).toEqual(['bills', 'list'])
      expect(billKeys.list({ isPaid: false })).toEqual(['bills', 'list', { isPaid: false }])
      expect(billKeys.details()).toEqual(['bills', 'detail'])
      expect(billKeys.detail('1')).toEqual(['bills', 'detail', '1'])
      expect(billKeys.upcoming(7)).toEqual(['bills', 'upcoming', 7])
      expect(billKeys.overdue()).toEqual(['bills', 'overdue'])
    })
  })
})
