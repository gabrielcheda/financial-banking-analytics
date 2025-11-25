import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAccounts,
  useAccount,
  useAccountSummary,
  useAccountBalance,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useActiveAccounts,
  accountKeys,
} from '@/hooks/useAccounts'
import { accountService } from '@/services/api/accounts.service'
import * as errorUtils from '@/lib/error-utils'

vi.mock('@/services/api/accounts.service', () => ({
  accountService: {
    getAccounts: vi.fn(),
    getAccountById: vi.fn(),
    getAccountSummary: vi.fn(),
    getAccountBalance: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    getActiveAccounts: vi.fn(),
  },
}))

vi.mock('@/lib/error-utils', () => ({
  showErrorToast: vi.fn(),
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

describe('useAccounts Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAccounts', () => {
    it('should fetch accounts successfully', async () => {
      const mockAccounts = [
        { id: '1', name: 'Checking', type: 'checking', balance: 1000, currency: 'USD' },
        { id: '2', name: 'Savings', type: 'savings', balance: 5000, currency: 'USD' },
      ]

      vi.mocked(accountService.getAccounts).mockResolvedValue(mockAccounts)

      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.getAccounts).toHaveBeenCalledWith(undefined)
      expect(result.current.data).toEqual(mockAccounts)
    })

    it('should fetch accounts with filters', async () => {
      const params = { type: 'checking', isActive: true }
      const mockAccounts = [
        { id: '1', name: 'Checking', type: 'checking', balance: 1000, currency: 'USD' },
      ]

      vi.mocked(accountService.getAccounts).mockResolvedValue(mockAccounts)

      const { result } = renderHook(() => useAccounts(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.getAccounts).toHaveBeenCalledWith(params)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch accounts')
      vi.mocked(accountService.getAccounts).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useAccount', () => {
    it('should fetch account by id', async () => {
      const mockAccount = {
        id: '1',
        name: 'Checking',
        type: 'checking',
        balance: 1000,
        currency: 'USD',
        transactions: [],
      }

      vi.mocked(accountService.getAccountById).mockResolvedValue(mockAccount)

      const { result } = renderHook(() => useAccount('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.getAccountById).toHaveBeenCalledWith('1')
      expect(result.current.data).toEqual(mockAccount)
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useAccount(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(accountService.getAccountById).not.toHaveBeenCalled()
    })

    it('should handle account fetch error', async () => {
      const mockError = new Error('Account not found')
      vi.mocked(accountService.getAccountById).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAccount('999'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useAccountSummary', () => {
    it('should fetch account summary', async () => {
      const mockSummary = {
        totalBalance: 10000,
        totalIncome: 5000,
        totalExpenses: 3000,
        accounts: 3,
      }

      vi.mocked(accountService.getAccountSummary).mockResolvedValue(mockSummary)

      const { result } = renderHook(() => useAccountSummary(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.getAccountSummary).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockSummary)
    })
  })

  describe('useAccountBalance', () => {
    it('should fetch account balance with pending transactions', async () => {
      const mockBalance = {
        current: 1000,
        pending: 200,
        available: 800,
      }

      vi.mocked(accountService.getAccountBalance).mockResolvedValue(mockBalance)

      const { result } = renderHook(() => useAccountBalance('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.getAccountBalance).toHaveBeenCalledWith('1')
      expect(result.current.data).toEqual(mockBalance)
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useAccountBalance(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(accountService.getAccountBalance).not.toHaveBeenCalled()
    })
  })

  describe('useCreateAccount', () => {
    it('should create account successfully', async () => {
      const newAccount = {
        name: 'New Savings',
        type: 'savings' as const,
        currency: 'USD',
        balance: 1000,
      }

      const mockResponse = { id: '3', ...newAccount }
      vi.mocked(accountService.createAccount).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCreateAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newAccount)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.createAccount).toHaveBeenCalledWith(newAccount)
    })

    it('should invalidate queries after creating account', async () => {
      const newAccount = {
        name: 'New Checking',
        type: 'checking' as const,
        currency: 'USD',
      }

      vi.mocked(accountService.createAccount).mockResolvedValue({} as any)

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

      const { result } = renderHook(() => useCreateAccount(), { wrapper })

      result.current.mutate(newAccount)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: accountKeys.all })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
    })

    it('should handle create account error', async () => {
      const newAccount = {
        name: 'Invalid Account',
        type: 'checking' as const,
        currency: 'USD',
      }

      const mockError = new Error('Failed to create account')
      vi.mocked(accountService.createAccount).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newAccount)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to create account')
    })
  })

  describe('useUpdateAccount', () => {
    it('should update account successfully', async () => {
      const updateData = { name: 'Updated Name', isActive: false }
      const mockResponse = { id: '1', ...updateData }

      vi.mocked(accountService.updateAccount).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUpdateAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.updateAccount).toHaveBeenCalledWith('1', updateData)
    })

    it('should invalidate queries after updating account', async () => {
      const updateData = { name: 'Updated' }

      vi.mocked(accountService.updateAccount).mockResolvedValue({} as any)

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

      const { result } = renderHook(() => useUpdateAccount(), { wrapper })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: accountKeys.all })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
    })

    it('should handle update account error', async () => {
      const updateData = { name: 'Updated' }
      const mockError = new Error('Failed to update')

      vi.mocked(accountService.updateAccount).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to update account')
    })
  })

  describe('useDeleteAccount', () => {
    it('should delete account successfully', async () => {
      vi.mocked(accountService.deleteAccount).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.deleteAccount).toHaveBeenCalledWith('1', undefined)
    })

    it('should delete account with transfer', async () => {
      vi.mocked(accountService.deleteAccount).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', transferToAccountId: '2' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.deleteAccount).toHaveBeenCalledWith('1', '2')
    })

    it('should invalidate multiple queries after deleting account', async () => {
      vi.mocked(accountService.deleteAccount).mockResolvedValue(undefined)

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

      const { result } = renderHook(() => useDeleteAccount(), { wrapper })

      result.current.mutate({ id: '1' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: accountKeys.all })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] })
    })

    it('should handle delete account error', async () => {
      const mockError = new Error('Cannot delete account with transactions')

      vi.mocked(accountService.deleteAccount).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to delete account')
    })
  })

  describe('useActiveAccounts', () => {
    it('should fetch active accounts', async () => {
      const mockActiveAccounts = [
        { id: '1', name: 'Active Checking', type: 'checking', isActive: true },
        { id: '2', name: 'Active Savings', type: 'savings', isActive: true },
      ]

      vi.mocked(accountService.getActiveAccounts).mockResolvedValue(mockActiveAccounts)

      const { result } = renderHook(() => useActiveAccounts(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(accountService.getActiveAccounts).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockActiveAccounts)
    })
  })

  describe('accountKeys', () => {
    it('should generate correct query keys', () => {
      expect(accountKeys.all).toEqual(['accounts'])
      expect(accountKeys.lists()).toEqual(['accounts', 'list'])
      expect(accountKeys.list({ type: 'checking' })).toEqual(['accounts', 'list', { type: 'checking' }])
      expect(accountKeys.details()).toEqual(['accounts', 'detail'])
      expect(accountKeys.detail('123')).toEqual(['accounts', 'detail', '123'])
      expect(accountKeys.summary()).toEqual(['accounts', 'summary'])
      expect(accountKeys.balance('123')).toEqual(['accounts', 'balance', '123'])
    })
  })
})
