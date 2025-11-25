/**
 * Tests for usePrefetch hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePrefetch } from '@/hooks/usePrefetch'
import { accountService } from '@/services/api/accounts.service'
import { transactionService } from '@/services/api/transactions.service'
import { budgetService } from '@/services/api/budgets.service'
import { billService } from '@/services/api/bills.service'
import { goalService } from '@/services/api/goals.service'
import { categoryService } from '@/services/api/categories.service'
import { merchantService } from '@/services/api/merchants.service'
import { analyticsService } from '@/services/api/analytics.service'
import { reportService } from '@/services/api/reports.service'

// Mock all services
vi.mock('@/services/api/accounts.service')
vi.mock('@/services/api/transactions.service')
vi.mock('@/services/api/budgets.service')
vi.mock('@/services/api/bills.service')
vi.mock('@/services/api/goals.service')
vi.mock('@/services/api/categories.service')
vi.mock('@/services/api/merchants.service')
vi.mock('@/services/api/analytics.service')
vi.mock('@/services/api/reports.service')

describe('usePrefetch Hook', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient?.clear()
  })

  describe('Individual Prefetch Functions', () => {
    it('should prefetch accounts', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      const params = { isActive: true }
      result.current.prefetchAccounts(params)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'list', params]),
        })
      )
    })

    it('should prefetch account summary', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchAccountSummary()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'summary']),
        })
      )
    })

    it('should prefetch active accounts', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchActiveAccounts()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'active']),
        })
      )
    })

    it('should prefetch transactions', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      const params = { page: 1, limit: 20 }
      result.current.prefetchTransactions(params)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['transactions', 'list', params]),
        })
      )
    })

    it('should prefetch recent transactions', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchRecentTransactions('account-1')

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['transactions', 'recent', 'account-1']),
        })
      )
    })

    it('should prefetch transaction detail', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchTransactionDetail('txn-1')

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['transactions', 'detail', 'txn-1']),
        })
      )
    })

    it('should prefetch budgets', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchBudgets()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['budgets', 'list']),
        })
      )
    })

    it('should prefetch budget detail', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchBudgetDetail('budget-1')

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['budgets', 'detail', 'budget-1']),
        })
      )
    })

    it('should prefetch bills', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchBills()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['bills', 'list']),
        })
      )
    })

    it('should prefetch upcoming bills', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchUpcomingBills(30)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['bills', 'upcoming', 30]),
        })
      )
    })

    it('should prefetch goals', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      const params = { status: 'active' }
      result.current.prefetchGoals(params)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['goals', 'list', params]),
        })
      )
    })

    it('should prefetch categories', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      const params = { type: 'expense' as const }
      result.current.prefetchCategories(params)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['categories', 'list', params]),
        })
      )
    })

    it('should prefetch merchants', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchMerchants()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['merchants', 'list']),
        })
      )
    })

    it('should prefetch analytics overview', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      const params = { startDate: '2024-01-01', endDate: '2024-12-31' }
      result.current.prefetchAnalyticsOverview(params)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analytics', 'overview', params]),
        })
      )
    })

    it('should prefetch category spending', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      const params = { startDate: '2024-01-01', endDate: '2024-12-31', limit: 10 }
      result.current.prefetchCategorySpending(params)

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analytics', 'category-spending', params]),
        })
      )
    })

    it('should prefetch reports', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchReports()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['reports'],
        })
      )
    })
  })

  describe('Composite Page Prefetches', () => {
    it('should prefetch dashboard data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchDashboardData()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'summary']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['transactions', 'recent']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['bills', 'upcoming', 7]),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['budgets', 'list']),
        })
      )
    })

    it('should prefetch accounts page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchAccountsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts']),
        })
      )
    })

    it('should prefetch transactions page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchTransactionsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['transactions']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'active']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['categories']),
        })
      )
    })

    it('should prefetch budgets page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchBudgetsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['budgets']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['categories']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'active']),
        })
      )
    })

    it('should prefetch bills page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchBillsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['bills']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'active']),
        })
      )
    })

    it('should prefetch goals page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchGoalsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['goals']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'active']),
        })
      )
    })

    it('should prefetch analytics page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchAnalyticsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analytics', 'overview']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analytics', 'category-spending']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['categories']),
        })
      )
    })

    it('should prefetch reports page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchReportsPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['reports'],
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['categories']),
        })
      )
    })

    it('should prefetch planning page data', () => {
      const prefetchSpy = vi.spyOn(QueryClient.prototype, 'prefetchQuery')
      
      const { result } = renderHook(() => usePrefetch(), {
        wrapper: createWrapper(),
      })

      result.current.prefetchPlanningPage()

      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['goals']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['budgets']),
        })
      )
      expect(prefetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['accounts', 'active']),
        })
      )
    })
  })
})
