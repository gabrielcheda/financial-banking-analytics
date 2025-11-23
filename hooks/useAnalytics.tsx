/**
 * Analytics Hooks
 *
 * React Query hooks for analytics and insights
 */

import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query'
import { analyticsService } from '@/services/api/analytics.service'
import type {
  AnalyticsOverviewDTO,
  TrendsAnalysisDTO,
  CashFlowDTO,
  CategorySpendingDTO,
} from '@/types/dto'

// Query Keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (params: any) => [...analyticsKeys.all, 'overview', params] as const,
  trends: (params: any) => [...analyticsKeys.all, 'trends', params] as const,
  cashFlow: (params: any) => [...analyticsKeys.all, 'cash-flow', params] as const,
  spending: (params: any) => [...analyticsKeys.all, 'spending', params] as const,
  netWorth: (params: any) => [...analyticsKeys.all, 'net-worth', params] as const,
  incomeVsExpenses: (params: any) => [...analyticsKeys.all, 'income-vs-expenses', params] as const,
}

/**
 * Hook to get analytics overview
 */
export function useAnalyticsOverview(
  params: {
    startDate: string
    endDate: string
    accountId?: string
  },
  options?: Omit<UseQueryOptions<AnalyticsOverviewDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => analyticsService.getOverview(params),
    enabled: !!params.startDate && !!params.endDate,
    ...options,
  })
}

/**
 * Hook to get spending trends
 */
export function useSpendingTrends(
  params: {
    startDate: string
    endDate: string
    categoryId?: string
  },
  options?: Omit<UseQueryOptions<TrendsAnalysisDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.trends({ ...params, type: 'spending' }),
    queryFn: () => analyticsService.getSpendingTrends(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  })
}

/**
 * Hook to get income trends
 */
export function useIncomeTrends(
  params: {
    startDate: string
    endDate: string
  },
  options?: Omit<UseQueryOptions<TrendsAnalysisDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.trends({ ...params, type: 'income' }),
    queryFn: () => analyticsService.getIncomeTrends(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  })
}

/**
 * Hook to get cash flow data
 */
export function useCashFlow(
  params: {
    startDate: string
    endDate: string
    interval?: 'daily' | 'weekly' | 'monthly'
  },
  options?: Omit<UseQueryOptions<CashFlowDTO[]>, 'queryKey' | 'queryFn'>
) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: analyticsKeys.cashFlow(params),
    queryFn: async () => {
      const overviewKey = analyticsKeys.overview(params)
      const cachedOverview = queryClient.getQueryData<AnalyticsOverviewDTO>(overviewKey)

      if (cachedOverview) {
        return cachedOverview.cashFlow || []
      }

      const overview = await analyticsService.getOverview(params)
      queryClient.setQueryData(overviewKey, overview)
      return overview.cashFlow || []
    },
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get spending by category
 */
export function useSpendingByCategory(
  params: {
    startDate: string
    endDate: string
    limit?: number
  },
  options?: Omit<UseQueryOptions<CategorySpendingDTO[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.spending(params),
    queryFn: () => analyticsService.getSpendingByCategory(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get income vs expenses comparison
 */
export function useIncomeVsExpenses(
  params?: {
    period?: 'daily' | 'weekly' | 'monthly'
    months?: number
  },
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.incomeVsExpenses(params || {}),
    queryFn: () => analyticsService.getIncomeVsExpenses(params || {}),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Hook to get net worth history
 */
export function useNetWorthHistory(
  params: {
    startDate: string
    endDate: string
    interval?: 'daily' | 'weekly' | 'monthly'
  },
  options?: Omit<UseQueryOptions<Array<{ date: string; value: number }>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.netWorth(params),
    queryFn: () => analyticsService.getNetWorthHistory(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  })
}

/**
 * Hook to get current month overview
 */
export function useCurrentMonthOverview() {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'current-month'],
    queryFn: () => analyticsService.getCurrentMonthOverview(),
  })
}

/**
 * Hook to get year-to-date overview
 */
export function useYearToDateOverview() {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'year-to-date'],
    queryFn: () => analyticsService.getYearToDateOverview(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
