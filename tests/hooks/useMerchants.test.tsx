/**
 * Tests for useMerchants hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as merchantHooks from '@/hooks/useMerchants'
import { merchantService } from '@/services/api/merchants.service'
import * as errorUtils from '@/lib/error-utils'
import type { MerchantDTO, CreateMerchantDTO, UpdateMerchantDTO, MerchantDetailStatsDTO } from '@/types/dto'

// Mock services
vi.mock('@/services/api/merchants.service')
vi.mock('@/lib/error-utils')

const { 
  useMerchants, 
  useMerchant, 
  useMerchantStats,
  useCreateMerchant, 
  useUpdateMerchant, 
  useDeleteMerchant,
  merchantKeys 
} = merchantHooks

describe('useMerchants Hooks', () => {
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

  describe('useMerchants', () => {
    it('should fetch all merchants', async () => {
      const mockMerchants: MerchantDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Amazon',
          category: 'Shopping',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(merchantService.getMerchants).mockResolvedValue(mockMerchants)

      const { result } = renderHook(() => useMerchants(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMerchants)
      expect(merchantService.getMerchants).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(merchantService.getMerchants).mockRejectedValue(mockError)

      const { result } = renderHook(() => useMerchants(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useMerchant', () => {
    it('should fetch merchant by id', async () => {
      const mockMerchant: MerchantDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Walmart',
        category: 'Groceries',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(merchantService.getMerchantById).mockResolvedValue(mockMerchant)

      const { result } = renderHook(() => useMerchant('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMerchant)
      expect(merchantService.getMerchantById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useMerchant(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(merchantService.getMerchantById).not.toHaveBeenCalled()
    })
  })

  describe('useMerchantStats', () => {
    it('should fetch merchant statistics', async () => {
      const mockStats: MerchantDetailStatsDTO = {
        merchant: {
          id: '1',
          userId: 'user-1',
          name: 'Target',
          category: 'Shopping',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        totalSpent: 1500.00,
        transactionCount: 25,
        avgTransactionAmount: 60.00,
        lastTransactionDate: new Date('2024-02-15'),
        categoryBreakdown: [],
      }

      vi.mocked(merchantService.getMerchantStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useMerchantStats('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStats)
      expect(merchantService.getMerchantStats).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useMerchantStats(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(merchantService.getMerchantStats).not.toHaveBeenCalled()
    })
  })

  describe('useCreateMerchant', () => {
    it('should create merchant successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockMerchant: MerchantDTO = {
        id: '1',
        userId: 'user-1',
        name: 'New Merchant',
        category: 'Dining',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const merchantData: CreateMerchantDTO = {
        name: 'New Merchant',
        category: 'Dining',
      }

      vi.mocked(merchantService.createMerchant).mockResolvedValue(mockMerchant)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateMerchant(), { wrapper })

      result.current.mutate(merchantData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(merchantService.createMerchant).toHaveBeenCalledWith(merchantData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: merchantKeys.all })
    })

    it('should handle create error', async () => {
      const mockError = new Error('Create failed')
      vi.mocked(merchantService.createMerchant).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateMerchant(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({} as CreateMerchantDTO)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Create Merchant')
    })
  })

  describe('useUpdateMerchant', () => {
    it('should update merchant successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockMerchant: MerchantDTO = {
        id: '1',
        userId: 'user-1',
        name: 'Updated Merchant',
        category: 'Entertainment',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const updateData: UpdateMerchantDTO = { name: 'Updated Merchant', category: 'Entertainment' }

      vi.mocked(merchantService.updateMerchant).mockResolvedValue(mockMerchant)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdateMerchant(), { wrapper })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(merchantService.updateMerchant).toHaveBeenCalledWith('1', updateData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: merchantKeys.all })
    })

    it('should handle update error', async () => {
      const mockError = new Error('Update failed')
      vi.mocked(merchantService.updateMerchant).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateMerchant(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Update Merchant')
    })
  })

  describe('useDeleteMerchant', () => {
    it('should delete merchant successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.mocked(merchantService.deleteMerchant).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteMerchant(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(merchantService.deleteMerchant).toHaveBeenCalledWith('1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: merchantKeys.all })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] })
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed')
      vi.mocked(merchantService.deleteMerchant).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteMerchant(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Delete Merchant')
    })
  })

  describe('merchantKeys', () => {
    it('should generate correct query keys', () => {
      expect(merchantKeys.all).toEqual(['merchants'])
      expect(merchantKeys.lists()).toEqual(['merchants', 'list'])
      expect(merchantKeys.list({ category: 'Shopping' })).toEqual(['merchants', 'list', { category: 'Shopping' }])
      expect(merchantKeys.details()).toEqual(['merchants', 'detail'])
      expect(merchantKeys.detail('1')).toEqual(['merchants', 'detail', '1'])
      expect(merchantKeys.stats('1')).toEqual(['merchants', 'stats', '1'])
    })
  })
})
