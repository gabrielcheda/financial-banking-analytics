/**
 * React Query Stale Time Constants
 * 
 * Centralized stale time configuration for consistent caching strategy
 */

export const STALE_TIMES = {
  // Static data that rarely changes
  CATEGORIES: 1000 * 60 * 10, // 10 minutes
  MERCHANTS: 1000 * 60 * 10, // 10 minutes
  
  // Semi-static data
  ACCOUNTS: 1000 * 60 * 5, // 5 minutes
  BUDGETS: 1000 * 60 * 5, // 5 minutes
  GOALS: 1000 * 60 * 5, // 5 minutes
  BILLS: 1000 * 60 * 5, // 5 minutes
  
  // Dynamic data
  TRANSACTIONS: 1000 * 60 * 3, // 3 minutes
  NOTIFICATIONS: 1000 * 30, // 30 seconds
  
  // Analytics data (expensive queries)
  ANALYTICS: 1000 * 60 * 10, // 10 minutes
  REPORTS: 1000 * 60 * 5, // 5 minutes
  
  // User data
  USER_PROFILE: 1000 * 60 * 10, // 10 minutes
  
  // Summary/aggregated data
  ACCOUNT_SUMMARY: 1000 * 60, // 1 minute
  TRANSACTION_RECENT: 1000 * 60, // 1 minute
  BILLS_UPCOMING: 1000 * 60 * 2, // 2 minutes
  BILLS_OVERDUE: 1000 * 60 * 2, // 2 minutes
  GOAL_PROGRESS: 1000 * 60 * 5, // 5 minutes
} as const

/**
 * Helper function to get stale time with fallback
 */
export function getStaleTime(key: keyof typeof STALE_TIMES): number {
  return STALE_TIMES[key]
}
