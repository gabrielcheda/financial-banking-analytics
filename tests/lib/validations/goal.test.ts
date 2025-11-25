import { describe, it, expect } from 'vitest'
import {
  createGoalSchema,
  updateGoalSchema,
  contributeToGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
  type ContributeToGoalInput,
} from '@/lib/validations/goal'

describe('Goal Validation Schemas', () => {
  describe('createGoalSchema', () => {
    it('should validate a valid goal', () => {
      const validData = {
        name: 'Emergency Fund',
        description: 'Save for emergencies',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: new Date('2024-12-31'),
        priority: 'high' as const,
        categoryId: 'cat-123',
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require goal name', () => {
      const invalidData = {
        name: '',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Name is required')
      }
    })

    it('should accept optional description', () => {
      const validData = {
        name: 'Vacation',
        targetAmount: 5000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require positive target amount', () => {
      const invalidData = {
        name: 'Goal',
        targetAmount: -1000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('must be positive')
      }
    })

    it('should not accept zero target amount', () => {
      const invalidData = {
        name: 'Goal',
        targetAmount: 0,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string target amount and transform to number', () => {
      const validData = {
        name: 'Goal',
        targetAmount: '10000.50',
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.targetAmount).toBe('number')
        expect(result.data.targetAmount).toBe(10000.50)
      }
    })

    it('should set default current amount to 0', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currentAmount).toBe(0)
      }
    })

    it('should accept optional current amount', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        currentAmount: 2500,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currentAmount).toBe(2500)
      }
    })

    it('should require non-negative current amount', () => {
      const invalidData = {
        name: 'Goal',
        targetAmount: 10000,
        currentAmount: -500,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be negative')
      }
    })

    it('should accept string current amount and transform to number', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        currentAmount: '2500.75',
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.currentAmount).toBe('number')
        expect(result.data.currentAmount).toBe(2500.75)
      }
    })

    it('should require deadline', () => {
      const invalidData = {
        name: 'Goal',
        targetAmount: 10000,
        deadline: '',
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid date')
      }
    })

    it('should validate priority enum values', () => {
      const priorities = ['low', 'medium', 'high'] as const

      priorities.forEach(priority => {
        const validData = {
          name: 'Goal',
          targetAmount: 10000,
          deadline: new Date('2024-12-31'),
          categoryId: 'cat-123',
          priority,
        }

        const result = createGoalSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('should accept optional categoryId', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept optional linkedAccountId', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
        linkedAccountId: 'acc-123',
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept optional notes', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
        notes: 'Important goal',
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('updateGoalSchema', () => {
    it('should validate a valid update', () => {
      const validData = {
        targetAmount: 15000,
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make all fields optional', () => {
      const emptyUpdate = {}
      const result = updateGoalSchema.safeParse(emptyUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate target amount when provided', () => {
      const invalidData = {
        targetAmount: -1000,
      }

      const result = updateGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string target amount and transform to number', () => {
      const validData = {
        targetAmount: '15000.50',
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.targetAmount).toBe('number')
        expect(result.data.targetAmount).toBe(15000.50)
      }
    })

    it('should validate current amount when provided', () => {
      const invalidData = {
        currentAmount: -500,
      }

      const result = updateGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string current amount and transform to number', () => {
      const validData = {
        currentAmount: '5000.25',
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.currentAmount).toBe('number')
        expect(result.data.currentAmount).toBe(5000.25)
      }
    })

    it('should accept name update', () => {
      const validData = {
        name: 'Updated Goal Name',
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept priority update', () => {
      const validData = {
        priority: 'high' as const,
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept status update', () => {
      const validData = {
        status: 'completed' as const,
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept multiple fields together', () => {
      const validData = {
        name: 'New Name',
        targetAmount: 20000,
        priority: 'high' as const,
        status: 'active' as const,
      }

      const result = updateGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('contributeToGoalSchema', () => {
    it('should validate a valid contribution', () => {
      const validData = {
        amount: 500,
        accountId: 'acc-123',
        date: new Date('2024-01-15'),
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require positive contribution amount', () => {
      const invalidData = {
        amount: -100,
        accountId: 'acc-123',
      }

      const result = contributeToGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('must be positive')
      }
    })

    it('should not accept zero contribution', () => {
      const invalidData = {
        amount: 0,
        accountId: 'acc-123',
      }

      const result = contributeToGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string amount and transform to number', () => {
      const validData = {
        amount: '500.75',
        accountId: 'acc-123',
        date: new Date(),
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.amount).toBe('number')
        expect(result.data.amount).toBe(500.75)
      }
    })

    it('should require accountId', () => {
      const invalidData = {
        amount: 500,
        accountId: '',
        date: new Date(),
      }

      const result = contributeToGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Account is required')
      }
    })

    it('should coerce string date to Date object', () => {
      const validData = {
        amount: 500,
        accountId: 'acc-123',
        date: '2024-01-15',
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date)
      }
    })

    it('should accept date field', () => {
      const validData = {
        amount: 500,
        accountId: 'acc-123',
        date: new Date(),
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date)
      }
    })

    it('should accept optional notes', () => {
      const validData = {
        amount: 500,
        accountId: 'acc-123',
        date: new Date(),
        notes: 'Bonus contribution',
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for createGoal', () => {
      const data: CreateGoalInput = {
        name: 'Emergency Fund',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.parse(data)
      expect(result.name).toBe('Emergency Fund')
      expect(result.targetAmount).toBe(10000)
    })

    it('should infer correct type for updateGoal', () => {
      const data: UpdateGoalInput = {
        targetAmount: 15000,
        status: 'completed' as const,
      }

      const result = updateGoalSchema.parse(data)
      expect(result.targetAmount).toBe(15000)
      expect(result.status).toBe('completed')
    })

    it('should infer correct type for contributeToGoal', () => {
      const data: ContributeToGoalInput = {
        amount: 500,
        accountId: 'acc-123',
        date: new Date(),
      }

      const result = contributeToGoalSchema.parse(data)
      expect(result.amount).toBe(500)
      expect(result.accountId).toBe('acc-123')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large target amounts', () => {
      const validData = {
        name: 'House',
        targetAmount: 999999.99,
        deadline: new Date('2030-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle decimal amounts', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 12345.678,
        currentAmount: 1234.567,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.targetAmount).toBe(12345.678)
        expect(result.data.currentAmount).toBe(1234.567)
      }
    })

    it('should allow current amount equal to target amount', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        currentAmount: 10000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'high' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow current amount greater than target amount', () => {
      const validData = {
        name: 'Goal',
        targetAmount: 10000,
        currentAmount: 12000,
        deadline: new Date('2024-12-31'),
        categoryId: 'cat-123',
        priority: 'medium' as const,
      }

      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle small contributions', () => {
      const validData = {
        amount: 0.01,
        accountId: 'acc-123',
        date: new Date(),
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle large contributions', () => {
      const validData = {
        amount: 999999.99,
        accountId: 'acc-123',
        date: new Date(),
      }

      const result = contributeToGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
