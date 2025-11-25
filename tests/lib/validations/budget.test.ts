import { describe, it, expect } from 'vitest'
import {
  createBudgetSchema,
  updateBudgetSchema,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from '@/lib/validations/budget'

describe('Budget Validation Schemas', () => {
  describe('createBudgetSchema', () => {
    it('should validate a valid budget', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date('2024-01-01'),
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require categoryId', () => {
      const invalidData = {
        categoryId: '',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Category is required')
      }
    })

    it('should require positive limit', () => {
      const invalidData = {
        categoryId: 'cat-123',
        limit: -100,
        period: 'monthly' as const,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('must be positive')
      }
    })

    it('should not accept zero limit', () => {
      const invalidData = {
        categoryId: 'cat-123',
        limit: 0,
        period: 'monthly' as const,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string limit and transform to number', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: '1000.50',
        period: 'monthly' as const,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.limit).toBe('number')
        expect(result.data.limit).toBe(1000.50)
      }
    })

    it('should validate period enum values', () => {
      const monthlyData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
      }

      const yearlyData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'yearly' as const,
        startDate: new Date(),
      }

      expect(createBudgetSchema.safeParse(monthlyData).success).toBe(true)
      expect(createBudgetSchema.safeParse(yearlyData).success).toBe(true)
    })

    it('should reject invalid period', () => {
      const invalidData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'weekly',
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require period', () => {
      const invalidData = {
        categoryId: 'cat-123',
        limit: 1000,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Period is required')
      }
    })

    it('should coerce string date to Date object', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: '2024-01-01',
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date)
      }
    })

    it('should accept optional alerts', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
        alerts: {
          enabled: true,
          threshold: 80,
        },
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default alert values', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
        alerts: {},
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.alerts?.enabled).toBe(true)
        expect(result.data.alerts?.threshold).toBe(80)
      }
    })

    it('should validate alert threshold min value', () => {
      const invalidData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
        alerts: {
          enabled: true,
          threshold: -10,
        },
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 0')
      }
    })

    it('should validate alert threshold max value', () => {
      const invalidData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
        alerts: {
          enabled: true,
          threshold: 150,
        },
      }

      const result = createBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 100')
      }
    })

    it('should accept threshold values within range', () => {
      const testValues = [0, 50, 80, 100]

      testValues.forEach(threshold => {
        const validData = {
          categoryId: 'cat-123',
          limit: 1000,
          period: 'monthly' as const,
          startDate: new Date(),
          alerts: {
            enabled: true,
            threshold,
          },
        }

        const result = createBudgetSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('updateBudgetSchema', () => {
    it('should validate a valid update', () => {
      const validData = {
        limit: 1500,
      }

      const result = updateBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make all fields optional', () => {
      const emptyUpdate = {}
      const result = updateBudgetSchema.safeParse(emptyUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate limit when provided', () => {
      const invalidData = {
        limit: -100,
      }

      const result = updateBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string limit and transform to number', () => {
      const validData = {
        limit: '2000.75',
      }

      const result = updateBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.limit).toBe('number')
        expect(result.data.limit).toBe(2000.75)
      }
    })

    it('should validate alerts when provided', () => {
      const validData = {
        alerts: {
          enabled: false,
          threshold: 90,
        },
      }

      const result = updateBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate alert threshold range in updates', () => {
      const invalidData = {
        alerts: {
          enabled: true,
          threshold: 120,
        },
      }

      const result = updateBudgetSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept multiple fields together', () => {
      const validData = {
        limit: 2500,
        alerts: {
          enabled: true,
          threshold: 75,
        },
      }

      const result = updateBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for createBudget', () => {
      const data: CreateBudgetInput = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly',
        startDate: new Date(),
      }

      const result = createBudgetSchema.parse(data)
      expect(result.categoryId).toBe('cat-123')
      expect(result.limit).toBe(1000)
    })

    it('should infer correct type for updateBudget', () => {
      const data: UpdateBudgetInput = {
        limit: 1500,
      }

      const result = updateBudgetSchema.parse(data)
      expect(result.limit).toBe(1500)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large limits', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 999999999.99,
        period: 'yearly' as const,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle decimal limits', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1234.56,
        period: 'monthly' as const,
        startDate: new Date(),
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(1234.56)
      }
    })

    it('should handle minimum threshold', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
        alerts: {
          enabled: false,
          threshold: 0,
        },
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle maximum threshold', () => {
      const validData = {
        categoryId: 'cat-123',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date(),
        alerts: {
          enabled: true,
          threshold: 100,
        },
      }

      const result = createBudgetSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
