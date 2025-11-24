/**
 * Query Key Factory
 * 
 * Centralized hierarchical query key generation for consistent invalidation
 * Follows the pattern: [resource, operation, ...params]
 */

export const queryKeyFactory = {
  // Auth & User
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeyFactory.auth.all, 'user'] as const,
    profile: () => [...queryKeyFactory.auth.all, 'profile'] as const,
  },

  // Accounts
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...queryKeyFactory.accounts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeyFactory.accounts.lists(), filters] as const,
    details: () => [...queryKeyFactory.accounts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.accounts.details(), id] as const,
    summary: () => [...queryKeyFactory.accounts.all, 'summary'] as const,
    active: () => [...queryKeyFactory.accounts.all, 'active'] as const,
  },

  // Transactions
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeyFactory.transactions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeyFactory.transactions.lists(), filters] as const,
    details: () => [...queryKeyFactory.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.transactions.details(), id] as const,
    recent: (accountId?: string) => [...queryKeyFactory.transactions.all, 'recent', accountId] as const,
    stats: (startDate: string, endDate: string, accountId?: string) => 
      [...queryKeyFactory.transactions.all, 'stats', { startDate, endDate, accountId }] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeyFactory.categories.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.categories.lists(), params] as const,
    details: () => [...queryKeyFactory.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.categories.details(), id] as const,
    spending: (params: Record<string, unknown>) => [...queryKeyFactory.categories.all, 'spending', params] as const,
    expense: () => [...queryKeyFactory.categories.all, 'expense'] as const,
    income: () => [...queryKeyFactory.categories.all, 'income'] as const,
    active: () => [...queryKeyFactory.categories.all, 'active'] as const,
  },

  // Merchants
  merchants: {
    all: ['merchants'] as const,
    lists: () => [...queryKeyFactory.merchants.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.merchants.lists(), params] as const,
    details: () => [...queryKeyFactory.merchants.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.merchants.details(), id] as const,
    byCategory: (categoryId: string) => [...queryKeyFactory.merchants.all, 'by-category', categoryId] as const,
  },

  // Budgets
  budgets: {
    all: ['budgets'] as const,
    lists: () => [...queryKeyFactory.budgets.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeyFactory.budgets.lists(), filters] as const,
    details: () => [...queryKeyFactory.budgets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.budgets.details(), id] as const,
    active: () => [...queryKeyFactory.budgets.all, 'active'] as const,
    summary: (month: string) => [...queryKeyFactory.budgets.all, 'summary', month] as const,
  },

  // Bills
  bills: {
    all: ['bills'] as const,
    lists: () => [...queryKeyFactory.bills.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.bills.lists(), params] as const,
    details: () => [...queryKeyFactory.bills.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.bills.details(), id] as const,
    upcoming: (days?: number) => [...queryKeyFactory.bills.all, 'upcoming', days] as const,
    overdue: () => [...queryKeyFactory.bills.all, 'overdue'] as const,
    recurring: () => [...queryKeyFactory.bills.all, 'recurring'] as const,
  },

  // Goals
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeyFactory.goals.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.goals.lists(), params] as const,
    details: () => [...queryKeyFactory.goals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.goals.details(), id] as const,
    progress: () => [...queryKeyFactory.goals.all, 'progress'] as const,
    active: () => [...queryKeyFactory.goals.all, 'active'] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: (params: Record<string, unknown>) => [...queryKeyFactory.analytics.all, 'overview', params] as const,
    spending: (params: Record<string, unknown>) => [...queryKeyFactory.analytics.all, 'spending', params] as const,
    income: (params: Record<string, unknown>) => [...queryKeyFactory.analytics.all, 'income', params] as const,
    trends: (params: Record<string, unknown>) => [...queryKeyFactory.analytics.all, 'trends', params] as const,
    categoryBreakdown: (params: Record<string, unknown>) => 
      [...queryKeyFactory.analytics.all, 'category-breakdown', params] as const,
    monthlyComparison: (params: Record<string, unknown>) => 
      [...queryKeyFactory.analytics.all, 'monthly-comparison', params] as const,
    netWorth: (params: Record<string, unknown>) => [...queryKeyFactory.analytics.all, 'net-worth', params] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeyFactory.reports.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.reports.lists(), params] as const,
    details: () => [...queryKeyFactory.reports.all, 'detail'] as const,
    detail: (id: string) => [...queryKeyFactory.reports.details(), id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeyFactory.notifications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeyFactory.notifications.lists(), filters] as const,
    unreadCount: () => [...queryKeyFactory.notifications.all, 'unread-count'] as const,
  },
} as const

/**
 * Helper to invalidate all queries for a resource
 */
export function getResourceQueryKey(resource: keyof typeof queryKeyFactory) {
  return queryKeyFactory[resource].all
}

/**
 * Helper to get all possible query keys for debugging
 */
export function getAllQueryKeys() {
  return Object.keys(queryKeyFactory)
}
