import { useQueryClient } from '@tanstack/react-query'
import { accountService } from '@/services/api/accounts.service'
import { transactionService } from '@/services/api/transactions.service'
import { budgetService } from '@/services/api/budgets.service'
import { billService } from '@/services/api/bills.service'
import { goalService } from '@/services/api/goals.service'
import { categoryService } from '@/services/api/categories.service'
import { merchantService } from '@/services/api/merchants.service'
import { analyticsService } from '@/services/api/analytics.service'
import { reportService } from '@/services/api/reports.service'
import { accountKeys } from './useAccounts'
import { transactionKeys } from './useTransactions'
import { budgetKeys } from './useBudgets'
import { billKeys } from './useBills'
import { goalKeys } from './useGoals'
import { categoryKeys } from './useCategories'
import { merchantKeys } from './useMerchants'

/**
 * Custom hook for prefetching data across the dashboard
 * Improves perceived performance by loading data before user navigation
 */
export function usePrefetch() {
  const queryClient = useQueryClient()

  // Account prefetches
  const prefetchAccounts = (params?: any) => {
    queryClient.prefetchQuery({
      queryKey: accountKeys.list(params),
      queryFn: () => accountService.getAccounts(params),
      staleTime: 30000, // 30 seconds
    })
  }

  const prefetchAccountSummary = () => {
    queryClient.prefetchQuery({
      queryKey: accountKeys.summary(),
      queryFn: () => accountService.getAccountSummary(),
      staleTime: 30000,
    })
  }

  const prefetchActiveAccounts = () => {
    queryClient.prefetchQuery({
      queryKey: [...accountKeys.all, 'active'],
      queryFn: () => accountService.getActiveAccounts(),
      staleTime: 30000,
    })
  }

  // Transaction prefetches
  const prefetchTransactions = (params?: any) => {
    queryClient.prefetchQuery({
      queryKey: transactionKeys.list(params || {}),
      queryFn: () => transactionService.getTransactions(params || {}),
      staleTime: 30000,
    })
  }

  const prefetchRecentTransactions = (accountId?: string) => {
    queryClient.prefetchQuery({
      queryKey: transactionKeys.recent(accountId),
      queryFn: () => transactionService.getRecentTransactions(accountId),
      staleTime: 30000,
    })
  }

  const prefetchTransactionDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: transactionKeys.detail(id),
      queryFn: () => transactionService.getTransactionById(id),
      staleTime: 30000,
    })
  }

  // Budget prefetches
  const prefetchBudgets = () => {
    queryClient.prefetchQuery({
      queryKey: budgetKeys.lists(),
      queryFn: () => budgetService.getBudgets(),
      staleTime: 30000,
    })
  }

  const prefetchBudgetDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: budgetKeys.detail(id),
      queryFn: () => budgetService.getBudgetById(id),
      staleTime: 30000,
    })
  }

  // Bill prefetches
  const prefetchBills = () => {
    queryClient.prefetchQuery({
      queryKey: billKeys.lists(),
      queryFn: () => billService.getBills(),
      staleTime: 30000,
    })
  }

  const prefetchUpcomingBills = (days: number = 7) => {
    queryClient.prefetchQuery({
      queryKey: billKeys.upcoming(days),
      queryFn: () => billService.getUpcomingBills(days),
      staleTime: 30000,
    })
  }

  const prefetchBillDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: billKeys.detail(id),
      queryFn: () => billService.getBillById(id),
      staleTime: 30000,
    })
  }

  // Goal prefetches
  const prefetchGoals = (params?: any) => {
    queryClient.prefetchQuery({
      queryKey: goalKeys.list(params),
      queryFn: () => goalService.getGoals(params),
      staleTime: 30000,
    })
  }

  const prefetchGoalDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: goalKeys.detail(id),
      queryFn: () => goalService.getGoalById(id),
      staleTime: 30000,
    })
  }

  // Category prefetches
  const prefetchCategories = (params?: { type?: 'income' | 'expense' }) => {
    queryClient.prefetchQuery({
      queryKey: categoryKeys.list(params),
      queryFn: () => categoryService.getCategories(params),
      staleTime: 30000,
    })
  }

  // Merchant prefetches
  const prefetchMerchants = () => {
    queryClient.prefetchQuery({
      queryKey: merchantKeys.lists(),
      queryFn: () => merchantService.getMerchants(),
      staleTime: 30000,
    })
  }

  // Removed: getMerchantStats now requires id parameter
  // const prefetchMerchantStats = () => {
  //   queryClient.prefetchQuery({
  //     queryKey: merchantKeys.stats(),
  //     queryFn: () => merchantService.getMerchantStats(),
  //     staleTime: 30000,
  //   })
  // }


  // Analytics prefetches
  const prefetchAnalyticsOverview = (params: { startDate: string; endDate: string; accountId?: string }) => {
    queryClient.prefetchQuery({
      queryKey: ['analytics', 'overview', params],
      queryFn: () => analyticsService.getOverview(params),
    })
  }

  const prefetchCategorySpending = (params: { startDate: string; endDate: string; limit?: number }) => {
    queryClient.prefetchQuery({
      queryKey: ['analytics', 'category-spending', params],
      queryFn: () => analyticsService.getSpendingByCategory(params),
      staleTime: 30000,
    })
  }

  // Reports prefetches
  const prefetchReports = () => {
    queryClient.prefetchQuery({
      queryKey: ['reports'],
      queryFn: () => reportService.getReports(),
      staleTime: 30000,
    })
  }

  // Composite prefetches for specific pages
  const prefetchDashboardData = () => {
    prefetchAccountSummary()
    prefetchRecentTransactions()
    prefetchUpcomingBills(7)
    prefetchBudgets()
  }

  const prefetchAccountsPage = () => {
    prefetchAccounts()
  }

  const prefetchTransactionsPage = () => {
    prefetchTransactions({ page: 1, limit: 20 })
    prefetchActiveAccounts()
    prefetchCategories()
  }

  const prefetchCategoriesPage = () => {
    prefetchCategories()
  }

  const prefetchMerchantsPage = () => {
    prefetchMerchants()
    // prefetchMerchantStats() // Removed: requires id parameter
    prefetchCategories()
  }

  const prefetchBudgetsPage = () => {
    prefetchBudgets()
    prefetchCategories()
    prefetchActiveAccounts()
  }

  const prefetchBillsPage = () => {
    prefetchBills()
    prefetchActiveAccounts()
  }

  const prefetchGoalsPage = () => {
    prefetchGoals()
    prefetchActiveAccounts()
  }

  const prefetchAnalyticsPage = () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    prefetchAnalyticsOverview({ startDate, endDate })
    prefetchCategorySpending({ startDate, endDate })
    prefetchCategories()
  }

  const prefetchReportsPage = () => {
    prefetchReports()
    prefetchCategories()
    prefetchActiveAccounts()
  }

  const prefetchPlanningPage = () => {
    prefetchGoals()
    prefetchBudgets()
    prefetchActiveAccounts()
  }

  return {
    // Individual prefetches
    prefetchAccounts,
    prefetchAccountSummary,
    prefetchActiveAccounts,
    prefetchTransactions,
    prefetchRecentTransactions,
    prefetchTransactionDetail,
    prefetchBudgets,
    prefetchBudgetDetail,
    prefetchBills,
    prefetchUpcomingBills,
    prefetchBillDetail,
    prefetchGoals,
    prefetchGoalDetail,
    prefetchCategories,
    prefetchMerchants,
    // prefetchMerchantStats, // Removed: requires id parameter
    prefetchAnalyticsOverview,
    prefetchCategorySpending,
    prefetchReports,

    // Composite page prefetches
    prefetchDashboardData,
    prefetchAccountsPage,
    prefetchTransactionsPage,
    prefetchCategoriesPage,
    prefetchMerchantsPage,
    prefetchBudgetsPage,
    prefetchBillsPage,
    prefetchGoalsPage,
    prefetchAnalyticsPage,
    prefetchReportsPage,
    prefetchPlanningPage,
  }
}
