import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useExportTransactions,
  useImportTransactions,
  useSearchTransactions,
  useRecentTransactions,
  transactionKeys,
} from '@/hooks/useTransactions'
import { transactionService } from '@/services/api/transactions.service'
import * as errorUtils from '@/lib/error-utils'

vi.mock('@/services/api/transactions.service', () => ({
  transactionService: {
    getTransactions: vi.fn(),
    getTransactionById: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    exportTransactions: vi.fn(),
    importCsv: vi.fn(),
    searchTransactions: vi.fn(),
    getRecentTransactions: vi.fn(),
  },
}))

vi.mock('@/lib/error-utils', () => ({
  showErrorToast: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

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

describe('useTransactions Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTransactions', () => {
    it('should fetch transactions with default filters', async () => {
      const mockResponse = {
        data: [
          { id: '1', description: 'Transaction 1', amount: 100 },
          { id: '2', description: 'Transaction 2', amount: 200 },
        ],
        total: 2,
        page: 1,
        limit: 10,
      }

      vi.mocked(transactionService.getTransactions).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.getTransactions).toHaveBeenCalledWith({})
      expect(result.current.data).toEqual(mockResponse)
    })

    it('should fetch transactions with filters', async () => {
      const filters = {
        accountId: '123',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        type: 'expense' as const,
      }

      const mockResponse = {
        data: [{ id: '1', description: 'Expense', amount: 100 }],
        total: 1,
        page: 1,
        limit: 10,
      }

      vi.mocked(transactionService.getTransactions).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTransactions(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.getTransactions).toHaveBeenCalledWith(filters)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch transactions')
      vi.mocked(transactionService.getTransactions).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useTransaction', () => {
    it('should fetch transaction by id', async () => {
      const mockTransaction = {
        id: '1',
        description: 'Test Transaction',
        amount: 100,
        date: new Date(),
      }

      vi.mocked(transactionService.getTransactionById).mockResolvedValue(mockTransaction)

      const { result } = renderHook(() => useTransaction('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.getTransactionById).toHaveBeenCalledWith('1')
      expect(result.current.data).toEqual(mockTransaction)
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useTransaction(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(transactionService.getTransactionById).not.toHaveBeenCalled()
    })
  })

  describe('useCreateTransaction', () => {
    it('should create transaction successfully', async () => {
      const newTransaction = {
        accountId: '123',
        categoryId: '456',
        description: 'New Transaction',
        amount: 100,
        date: new Date(),
        type: 'expense' as const,
      }

      const mockResponse = { id: '1', ...newTransaction }
      vi.mocked(transactionService.createTransaction).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newTransaction)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.createTransaction).toHaveBeenCalledWith(newTransaction)
    })

    it('should invalidate queries after creating transaction', async () => {
      const newTransaction = {
        accountId: '123',
        categoryId: '456',
        description: 'Test',
        amount: 100,
        date: new Date(),
        type: 'expense' as const,
      }

      vi.mocked(transactionService.createTransaction).mockResolvedValue({} as any)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateTransaction(), { wrapper })

      result.current.mutate(newTransaction)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalled()
    })

    it('should handle create error', async () => {
      const mockError = new Error('Failed to create')
      vi.mocked(transactionService.createTransaction).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({} as any)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Create Transaction')
    })
  })

  describe('useUpdateTransaction', () => {
    it('should update transaction successfully', async () => {
      const updateData = { description: 'Updated', amount: 200 }
      const mockResponse = { id: '1', ...updateData }

      vi.mocked(transactionService.updateTransaction).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUpdateTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.updateTransaction).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update error', async () => {
      const mockError = new Error('Failed to update')
      vi.mocked(transactionService.updateTransaction).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: {} })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Update Transaction')
    })
  })

  describe('useDeleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      vi.mocked(transactionService.deleteTransaction).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.deleteTransaction).toHaveBeenCalledWith('1')
    })

    it('should remove query after deletion', async () => {
      vi.mocked(transactionService.deleteTransaction).mockResolvedValue(undefined)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteTransaction(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(removeSpy).toHaveBeenCalledWith({ queryKey: transactionKeys.detail('1') })
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Failed to delete')
      vi.mocked(transactionService.deleteTransaction).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteTransaction(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to Delete Transaction')
    })
  })

  describe('useExportTransactions', () => {
    it('should export transactions as CSV', async () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' })
      vi.mocked(transactionService.exportTransactions).mockResolvedValue(mockBlob)

      // Mock URL methods BEFORE render
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url')
      const mockRevokeObjectURL = vi.fn()
      
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
        writable: true,
        configurable: true,
      })

      // Create a real DOM element and mock its click
      const mockLink = document.createElement('a')
      const mockClick = vi.fn()
      mockLink.click = mockClick

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      const { result } = renderHook(() => useExportTransactions(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({})

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.exportTransactions).toHaveBeenCalledWith({})
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()

      createElementSpy.mockRestore()
    })
  })

  describe('useImportTransactions', () => {
    it('should import transactions from CSV', async () => {
      const mockFile = new File(['data'], 'transactions.csv', { type: 'text/csv' })
      const mockResult = {
        imported: 10,
        errors: [],
      }

      vi.mocked(transactionService.importCsv).mockResolvedValue(mockResult)

      const { result } = renderHook(() => useImportTransactions(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.importCsv).toHaveBeenCalledWith(mockFile)
    })
  })

  describe('useSearchTransactions', () => {
    it('should search transactions with query', async () => {
      const query = 'grocery'
      const mockResults = [
        { id: '1', description: 'Grocery store', amount: 50 },
      ]

      vi.mocked(transactionService.searchTransactions).mockResolvedValue(mockResults)

      const { result } = renderHook(() => useSearchTransactions(query), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.searchTransactions).toHaveBeenCalledWith(query)
      expect(result.current.data).toEqual(mockResults)
    })

    it('should not search with short query', () => {
      const { result } = renderHook(() => useSearchTransactions('ab'), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(transactionService.searchTransactions).not.toHaveBeenCalled()
    })
  })

  describe('useRecentTransactions', () => {
    it('should fetch recent transactions', async () => {
      const mockRecent = [
        { id: '1', description: 'Recent 1', amount: 100 },
        { id: '2', description: 'Recent 2', amount: 200 },
      ]

      vi.mocked(transactionService.getRecentTransactions).mockResolvedValue(mockRecent)

      const { result } = renderHook(() => useRecentTransactions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.getRecentTransactions).toHaveBeenCalledWith(undefined)
      expect(result.current.data).toEqual(mockRecent)
    })

    it('should fetch recent transactions for specific account', async () => {
      const mockRecent = [{ id: '1', description: 'Recent', amount: 100 }]

      vi.mocked(transactionService.getRecentTransactions).mockResolvedValue(mockRecent)

      const { result } = renderHook(() => useRecentTransactions('123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(transactionService.getRecentTransactions).toHaveBeenCalledWith('123')
    })
  })

  describe('transactionKeys', () => {
    it('should generate correct query keys', () => {
      expect(transactionKeys.all).toEqual(['transactions'])
      expect(transactionKeys.lists()).toEqual(['transactions', 'list'])
      expect(transactionKeys.list({ page: 1 })).toEqual(['transactions', 'list', { page: 1 }])
      expect(transactionKeys.details()).toEqual(['transactions', 'detail'])
      expect(transactionKeys.detail('123')).toEqual(['transactions', 'detail', '123'])
    })
  })
})
