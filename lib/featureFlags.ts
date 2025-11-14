/**
 * Feature Flags System
 *
 * Permite ativar/desativar features em produção sem deploy
 */

export type FeatureFlag =
  | 'ai_insights'
  | 'bank_sync'
  | 'multi_currency'
  | 'real_time'
  | 'virtual_scrolling'
  | 'advanced_charts'
  | 'export_excel'
  | 'export_pdf'
  | 'receipt_ocr'
  | 'collaborative_budgets'

interface FeatureFlagConfig {
  enabled: boolean
  description: string
  requiresAuth?: boolean
}

const defaultFlags: Record<FeatureFlag, FeatureFlagConfig> = {
  ai_insights: {
    enabled: false,
    description: 'AI-powered financial insights',
    requiresAuth: true,
  },
  bank_sync: {
    enabled: false,
    description: 'Automatic bank synchronization',
    requiresAuth: true,
  },
  multi_currency: {
    enabled: false,
    description: 'Multi-currency support',
  },
  real_time: {
    enabled: false,
    description: 'Real-time notifications via WebSocket',
    requiresAuth: true,
  },
  virtual_scrolling: {
    enabled: true,
    description: 'Virtual scrolling for large lists',
  },
  advanced_charts: {
    enabled: true,
    description: 'Advanced interactive charts',
  },
  export_excel: {
    enabled: true,
    description: 'Export to Excel',
  },
  export_pdf: {
    enabled: true,
    description: 'Export to PDF',
  },
  receipt_ocr: {
    enabled: false,
    description: 'Receipt OCR scanning',
    requiresAuth: true,
  },
  collaborative_budgets: {
    enabled: false,
    description: 'Shared budgets with other users',
    requiresAuth: true,
  },
}

/**
 * Check if a feature is enabled
 *
 * In production, this should check against a remote config service
 * or environment variables
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Check environment variable first
  const envVar = process.env[`NEXT_PUBLIC_ENABLE_${flag.toUpperCase()}`]
  if (envVar !== undefined) {
    return envVar === 'true'
  }

  // Fall back to default config
  return defaultFlags[flag]?.enabled ?? false
}

/**
 * Get all feature flags with their status
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const flags: Partial<Record<FeatureFlag, boolean>> = {}

  Object.keys(defaultFlags).forEach((key) => {
    flags[key as FeatureFlag] = isFeatureEnabled(key as FeatureFlag)
  })

  return flags as Record<FeatureFlag, boolean>
}

/**
 * Get feature flag configuration
 */
export function getFeatureFlagConfig(flag: FeatureFlag): FeatureFlagConfig | undefined {
  return defaultFlags[flag]
}

/**
 * React hook for feature flags (optional, for convenience)
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  // In a real app, this could subscribe to real-time updates
  return isFeatureEnabled(flag)
}
