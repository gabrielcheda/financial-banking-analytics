/**
 * Environment Configuration
 * 
 * Centralized environment variable access with type safety and validation
 */

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    // Client-side: only NEXT_PUBLIC_ variables are available
    return (process.env[key] || fallback)
  }
  // Server-side: all variables available
  return process.env[key] || fallback
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, fallback: boolean = false): boolean {
  const value = getEnvVar(key, String(fallback))
  return value === 'true' || value === '1' || value === 'yes'
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, fallback: number = 0): number {
  const value = getEnvVar(key, String(fallback))
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * API Configuration
 */
export const apiConfig = {
  // Backend API URL (server-side proxy)
  backendUrl: getEnvVar('BACKEND_API_URL', 'http://localhost:3001/api/v1'),
  
  // Frontend API proxy base (client-side)
  proxyBase: getEnvVar('NEXT_PUBLIC_API_PROXY_BASE_URL', '/api/internal'),
  
  // Site URL for absolute URLs
  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL') ||
    getEnvVar('NEXT_SERVER_URL') ||
    (getEnvVar('VERCEL_URL') ? `https://${getEnvVar('VERCEL_URL')}` : `http://localhost:${getEnvVar('PORT', '3000')}`),
  
  // Request timeout
  timeout: getNumberEnv('NEXT_PUBLIC_API_TIMEOUT', 30000),
} as const

/**
 * Feature Flags
 */
export const featureFlags = {
  enableAiInsights: getBooleanEnv('NEXT_PUBLIC_ENABLE_AI_INSIGHTS', false),
  enableBankSync: getBooleanEnv('NEXT_PUBLIC_ENABLE_BANK_SYNC', false),
  enableReceiptOcr: getBooleanEnv('NEXT_PUBLIC_ENABLE_RECEIPT_OCR', false),
  enableMultiCurrency: getBooleanEnv('NEXT_PUBLIC_ENABLE_MULTI_CURRENCY', false),
  enableVirtualScrolling: getBooleanEnv('NEXT_PUBLIC_ENABLE_VIRTUAL_SCROLLING', true),
  enableOptimisticUpdates: getBooleanEnv('NEXT_PUBLIC_ENABLE_OPTIMISTIC_UPDATES', true),
} as const

/**
 * App Configuration
 */
export const appConfig = {
  name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'BankDash'),
  version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '0.3.0'),
  environment: getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('NODE_ENV') === 'production',
  isTest: getEnvVar('NODE_ENV') === 'test',
  port: getNumberEnv('PORT', 3000),
} as const

/**
 * Analytics Configuration
 */
export const analyticsConfig = {
  googleAnalyticsId: getEnvVar('NEXT_PUBLIC_GA_ID', ''),
  plausibleDomain: getEnvVar('NEXT_PUBLIC_PLAUSIBLE_DOMAIN', ''),
  enabled: getBooleanEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', false),
} as const

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required = [
    'BACKEND_API_URL',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((key) => `  - ${key}`).join('\n')}\n\nPlease check your .env.local file.`
    )
  }
}

/**
 * Get all environment variables for debugging (server-side only)
 */
export function getDebugEnv(): Record<string, string> {
  if (typeof window !== 'undefined') {
    return { error: 'Debug env only available server-side' }
  }

  return {
    NODE_ENV: appConfig.environment,
    BACKEND_API_URL: apiConfig.backendUrl,
    SITE_URL: apiConfig.siteUrl,
    // Don't expose sensitive variables in debug output
  }
}
