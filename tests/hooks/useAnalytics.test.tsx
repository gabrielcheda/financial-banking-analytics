/**
 * Tests for useAnalytics hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as analyticsHooks from '@/hooks/useAnalytics'
import { analyticsService } from '@/services/api/analytics.service'
import type { 
  AnalyticsOverviewDTO, 
  TrendsAnalysisDTO, 
  CashFlowDTO,
  CategorySpendingDTO 
} from '@/types/dto'

// Mock services
vi.mock('@/services/api/analytics.service')

const { 
  useAnalyticsOverview, 
  useSpendingTrends,
  useIncomeTrends,
  useCashFlow, 
  useSpendingByCategory,
  useIncomeVsExpenses,
  useNetWorthHistory,
  useCurrentMonthOverview,
  useYearToDateOverview,
  analyticsKeys 
} = analyticsHooks

describe('useAnalytics Hooks', () => {
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

  describe('useAnalyticsOverview', () => {
    it('should fetch overview with required params', async () => {
      const mockOverview: AnalyticsOverviewDTO = {
        totalIncome: 5000.00,
        totalExpenses: 3000.00,
        netIncome: 2000.00,
        balance: 10000.00,
        savingsRate: 40,
        cashFlow: [],
        categorySpending: [],
      }

      const params = { startDate: '2024-01-01', endDate: '2024-12-31' }
      vi.mocked(analyticsService.getOverview).mockResolvedValue(mockOverview)

      const { result } = renderHook(() => useAnalyticsOverview(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockOverview)
      expect(analyticsService.getOverview).toHaveBeenCalledWith(params)
    })

    it('should not fetch when dates are missing', () => {
      const params = { startDate: '', endDate: '' }

      const { result } = renderHook(() => useAnalyticsOverview(params), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(analyticsService.getOverview).not.toHaveBeenCalled()
    })

    it('should fetch with optional accountId', async () => {
      const mockOverview: AnalyticsOverviewDTO = {
        totalIncome: 3000.00,
        totalExpenses: 2000.00,
        netIncome: 1000.00,
        balance: 5000.00,
        savingsRate: 33,
        cashFlow: [],
        categorySpending: [],
      }

      const params = { startDate: '2024-01-01', endDate: '2024-12-31', accountId: 'account-1' }
      vi.mocked(analyticsService.getOverview).mockResolvedValue(mockOverview)

      const { result } = renderHook(() => useAnalyticsOverview(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(analyticsService.getOverview).toHaveBeenCalledWith(params)
    })
  })

  describe('useSpendingTrends', () => {
    it('should fetch spending trends', async () => {
      const mockTrends: TrendsAnalysisDTO = {
        trend: 'increasing' as const,
        percentageChange: 15.5,
        average: 1200.00,
        forecast: 1300.00,
        data: [],
      }

      const params = { startDate: '2024-01-01', endDate: '2024-12-31' }
      vi.mocked(analyticsService.getSpendingTrends).mockResolvedValue(mockTrends)

      const { result } = renderHook(() => useSpendingTrends(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockTrends)
      expect(analyticsService.getSpendingTrends).toHaveBeenCalledWith(params)
    })

    it('should not fetch when dates are missing', () => {
      const params = { startDate: '', endDate: '' }

      const { result } = renderHook(() => useSpendingTrends(params), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(analyticsService.getSpendingTrends).not.toHaveBeenCalled()
    })
  })

  describe('useIncomeTrends', () => {
    it('should fetch income trends', async () => {
      const mockTrends: TrendsAnalysisDTO = {
        trend: 'stable' as const,
        percentageChange: 2.5,
        average: 4500.00,
        forecast: 4600.00,
        data: [],
      }

      const params = { startDate: '2024-01-01', endDate: '2024-12-31' }
      vi.mocked(analyticsService.getIncomeTrends).mockResolvedValue(mockTrends)

      const { result } = renderHook(() => useIncomeTrends(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockTrends)
      expect(analyticsService.getIncomeTrends).toHaveBeenCalledWith(params)
    })

    it('should not fetch when dates are missing', () => {
      const params = { startDate: '', endDate: '' }

      const { result } = renderHook(() => useIncomeTrends(params), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(analyticsService.getIncomeTrends).not.toHaveBeenCalled()
    })
  })

  describe('useCashFlow', () => {
    it('should fetch cash flow data', async () => {
      const mockCashFlow: CashFlowDTO[] = [
        {
          date: '2024-01',
          income: 5000.00,
          expenses: 3000.00,
          netFlow: 2000.00,
        },
      ]

      const mockOverview: AnalyticsOverviewDTO = {
        totalIncome: 5000.00,
        totalExpenses: 3000.00,
        netIncome: 2000.00,
        balance: 10000.00,
        savingsRate: 40,
        cashFlow: mockCashFlow,
        categorySpending: [],
      }

      const params = { startDate: '2024-01-01', endDate: '2024-12-31', interval: 'monthly' as const }
      vi.mocked(analyticsService.getOverview).mockResolvedValue(mockOverview)

      const { result } = renderHook(() => useCashFlow(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCashFlow)
    })

    it('should not fetch when dates are missing', () => {
      const params = { startDate: '', endDate: '' }

      const { result } = renderHook(() => useCashFlow(params), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(analyticsService.getOverview).not.toHaveBeenCalled()
    })
  })

  describe('useSpendingByCategory', () => {
    it('should fetch spending by category', async () => {
      const mockSpending: CategorySpendingDTO[] = [
        {
          categoryId: '1',
          categoryName: 'Groceries',
          amount: 1200.00,
          percentage: 40,
          transactionCount: 25,
        },
      ]

      const params = { startDate: '2024-01-01', endDate: '2024-12-31', limit: 10 }
      vi.mocked(analyticsService.getSpendingByCategory).mockResolvedValue(mockSpending)

      const { result } = renderHook(() => useSpendingByCategory(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSpending)
      expect(analyticsService.getSpendingByCategory).toHaveBeenCalledWith(params)
    })

    it('should not fetch when dates are missing', () => {
      const params = { startDate: '', endDate: '' }

      const { result } = renderHook(() => useSpendingByCategory(params), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(analyticsService.getSpendingByCategory).not.toHaveBeenCalled()
    })
  })

  describe('useIncomeVsExpenses', () => {
    it('should fetch income vs expenses comparison', async () => {
      const mockData = [
        { period: '2024-01', income: 5000.00, expenses: 3000.00 },
        { period: '2024-02', income: 5500.00, expenses: 3200.00 },
      ]

      vi.mocked(analyticsService.getIncomeVsExpenses).mockResolvedValue(mockData)

      const { result } = renderHook(() => useIncomeVsExpenses(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
      expect(analyticsService.getIncomeVsExpenses).toHaveBeenCalledWith({})
    })

    it('should fetch with custom params', async () => {
      const mockData = [{ period: '2024-Q1', income: 15000.00, expenses: 9000.00 }]

      const params = { period: 'monthly' as const, months: 6 }
      vi.mocked(analyticsService.getIncomeVsExpenses).mockResolvedValue(mockData)

      const { result } = renderHook(() => useIncomeVsExpenses(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(analyticsService.getIncomeVsExpenses).toHaveBeenCalledWith(params)
    })
  })

  describe('useNetWorthHistory', () => {
    it('should fetch net worth history', async () => {
      const mockHistory = [
        { date: '2024-01-01', value: 10000.00 },
        { date: '2024-02-01', value: 12000.00 },
      ]

      const params = { startDate: '2024-01-01', endDate: '2024-12-31', interval: 'monthly' as const }
      vi.mocked(analyticsService.getNetWorthHistory).mockResolvedValue(mockHistory)

      const { result } = renderHook(() => useNetWorthHistory(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockHistory)
      expect(analyticsService.getNetWorthHistory).toHaveBeenCalledWith(params)
    })

    it('should not fetch when dates are missing', () => {
      const params = { startDate: '', endDate: '' }

      const { result } = renderHook(() => useNetWorthHistory(params), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(analyticsService.getNetWorthHistory).not.toHaveBeenCalled()
    })
  })

  describe('useCurrentMonthOverview', () => {
    it('should fetch current month overview', async () => {
      const mockOverview = {
        month: '2024-02',
        totalIncome: 5000.00,
        totalExpenses: 3000.00,
        netIncome: 2000.00,
      }

      vi.mocked(analyticsService.getCurrentMonthOverview).mockResolvedValue(mockOverview)

      const { result } = renderHook(() => useCurrentMonthOverview(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockOverview)
      expect(analyticsService.getCurrentMonthOverview).toHaveBeenCalled()
    })
  })

  describe('useYearToDateOverview', () => {
    it('should fetch year to date overview', async () => {
      const mockOverview = {
        year: 2024,
        totalIncome: 60000.00,
        totalExpenses: 36000.00,
        netIncome: 24000.00,
      }

      vi.mocked(analyticsService.getYearToDateOverview).mockResolvedValue(mockOverview)

      const { result } = renderHook(() => useYearToDateOverview(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockOverview)
      expect(analyticsService.getYearToDateOverview).toHaveBeenCalled()
    })
  })

  describe('analyticsKeys', () => {
    it('should generate correct query keys', () => {
      const params = { startDate: '2024-01-01', endDate: '2024-12-31' }

      expect(analyticsKeys.all).toEqual(['analytics'])
      expect(analyticsKeys.overview(params)).toEqual(['analytics', 'overview', params])
      expect(analyticsKeys.trends(params)).toEqual(['analytics', 'trends', params])
      expect(analyticsKeys.cashFlow(params)).toEqual(['analytics', 'cash-flow', params])
      expect(analyticsKeys.spending(params)).toEqual(['analytics', 'spending', params])
      expect(analyticsKeys.netWorth(params)).toEqual(['analytics', 'net-worth', params])
      expect(analyticsKeys.incomeVsExpenses(params)).toEqual(['analytics', 'income-vs-expenses', params])
    })
  })
})
