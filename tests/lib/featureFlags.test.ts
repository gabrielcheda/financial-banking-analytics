import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isFeatureEnabled,
  getAllFeatureFlags,
  getFeatureFlagConfig,
} from '@/lib/featureFlags'

describe('Feature Flags', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isFeatureEnabled', () => {
    it('should return default value when no env var is set', () => {
      expect(isFeatureEnabled('virtual_scrolling')).toBe(true) // default is true
      expect(isFeatureEnabled('ai_insights')).toBe(false) // default is false
    })

    it('should respect environment variable override', () => {
      process.env.NEXT_PUBLIC_ENABLE_AI_INSIGHTS = 'true'
      expect(isFeatureEnabled('ai_insights')).toBe(true)

      process.env.NEXT_PUBLIC_ENABLE_VIRTUAL_SCROLLING = 'false'
      expect(isFeatureEnabled('virtual_scrolling')).toBe(false)
    })

    it('should handle string "true" for enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_BANK_SYNC = 'true'
      expect(isFeatureEnabled('bank_sync')).toBe(true)
    })

    it('should handle anything other than "true" as disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_BANK_SYNC = 'false'
      expect(isFeatureEnabled('bank_sync')).toBe(false)

      process.env.NEXT_PUBLIC_ENABLE_BANK_SYNC = '1'
      expect(isFeatureEnabled('bank_sync')).toBe(false)

      process.env.NEXT_PUBLIC_ENABLE_BANK_SYNC = 'yes'
      expect(isFeatureEnabled('bank_sync')).toBe(false)
    })

    it('should return false for unknown feature flags', () => {
      // @ts-expect-error - testing invalid flag
      expect(isFeatureEnabled('unknown_flag')).toBe(false)
    })

    it('should work with all defined feature flags', () => {
      const flags = [
        'ai_insights',
        'bank_sync',
        'multi_currency',
        'real_time',
        'virtual_scrolling',
        'advanced_charts',
        'export_excel',
        'export_pdf',
        'receipt_ocr',
        'collaborative_budgets',
      ]

      flags.forEach(flag => {
        const result = isFeatureEnabled(flag as any)
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('getAllFeatureFlags', () => {
    it('should return all feature flags with their status', () => {
      const flags = getAllFeatureFlags()

      expect(flags).toHaveProperty('ai_insights')
      expect(flags).toHaveProperty('bank_sync')
      expect(flags).toHaveProperty('multi_currency')
      expect(flags).toHaveProperty('real_time')
      expect(flags).toHaveProperty('virtual_scrolling')
      expect(flags).toHaveProperty('advanced_charts')
      expect(flags).toHaveProperty('export_excel')
      expect(flags).toHaveProperty('export_pdf')
      expect(flags).toHaveProperty('receipt_ocr')
      expect(flags).toHaveProperty('collaborative_budgets')
    })

    it('should return boolean values for all flags', () => {
      const flags = getAllFeatureFlags()

      Object.values(flags).forEach(value => {
        expect(typeof value).toBe('boolean')
      })
    })

    it('should respect environment overrides in getAllFeatureFlags', () => {
      process.env.NEXT_PUBLIC_ENABLE_AI_INSIGHTS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_BANK_SYNC = 'true'

      const flags = getAllFeatureFlags()

      expect(flags.ai_insights).toBe(true)
      expect(flags.bank_sync).toBe(true)
    })

    it('should return correct default values', () => {
      const flags = getAllFeatureFlags()

      // These are enabled by default
      expect(flags.virtual_scrolling).toBe(true)
      expect(flags.advanced_charts).toBe(true)
      expect(flags.export_excel).toBe(true)
      expect(flags.export_pdf).toBe(true)

      // These are disabled by default
      expect(flags.ai_insights).toBe(false)
      expect(flags.bank_sync).toBe(false)
      expect(flags.multi_currency).toBe(false)
      expect(flags.real_time).toBe(false)
      expect(flags.receipt_ocr).toBe(false)
      expect(flags.collaborative_budgets).toBe(false)
    })
  })

  describe('getFeatureFlagConfig', () => {
    it('should return config for valid feature flags', () => {
      const config = getFeatureFlagConfig('ai_insights')

      expect(config).toBeDefined()
      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('description')
    })

    it('should include requiresAuth for protected features', () => {
      const config = getFeatureFlagConfig('ai_insights')

      expect(config?.requiresAuth).toBe(true)
    })

    it('should not have requiresAuth for public features', () => {
      const config = getFeatureFlagConfig('virtual_scrolling')

      expect(config?.requiresAuth).toBeUndefined()
    })

    it('should return undefined for unknown flags', () => {
      // @ts-expect-error - testing invalid flag
      const config = getFeatureFlagConfig('unknown_flag')

      expect(config).toBeUndefined()
    })

    it('should have descriptive text for all flags', () => {
      const flags = [
        'ai_insights',
        'bank_sync',
        'multi_currency',
        'real_time',
        'virtual_scrolling',
        'advanced_charts',
        'export_excel',
        'export_pdf',
        'receipt_ocr',
        'collaborative_budgets',
      ]

      flags.forEach(flag => {
        const config = getFeatureFlagConfig(flag as any)
        expect(config?.description).toBeTruthy()
        expect(config?.description.length).toBeGreaterThan(10)
      })
    })

    it('should return correct config for ai_insights', () => {
      const config = getFeatureFlagConfig('ai_insights')

      expect(config).toEqual({
        enabled: false,
        description: 'AI-powered financial insights',
        requiresAuth: true,
      })
    })

    it('should return correct config for virtual_scrolling', () => {
      const config = getFeatureFlagConfig('virtual_scrolling')

      expect(config).toEqual({
        enabled: true,
        description: 'Virtual scrolling for large lists',
      })
    })
  })

  describe('Feature Flag Integration', () => {
    it('should enable feature via env var and reflect in getAllFeatureFlags', () => {
      process.env.NEXT_PUBLIC_ENABLE_MULTI_CURRENCY = 'true'

      expect(isFeatureEnabled('multi_currency')).toBe(true)

      const allFlags = getAllFeatureFlags()
      expect(allFlags.multi_currency).toBe(true)
    })

    it('should handle multiple env var overrides', () => {
      process.env.NEXT_PUBLIC_ENABLE_AI_INSIGHTS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_BANK_SYNC = 'true'
      process.env.NEXT_PUBLIC_ENABLE_RECEIPT_OCR = 'true'

      expect(isFeatureEnabled('ai_insights')).toBe(true)
      expect(isFeatureEnabled('bank_sync')).toBe(true)
      expect(isFeatureEnabled('receipt_ocr')).toBe(true)

      const allFlags = getAllFeatureFlags()
      expect(allFlags.ai_insights).toBe(true)
      expect(allFlags.bank_sync).toBe(true)
      expect(allFlags.receipt_ocr).toBe(true)
    })
  })
})
