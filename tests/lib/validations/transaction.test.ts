import { describe, it, expect } from 'vitest'
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '@/lib/validations/transaction'

describe('Transaction Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    it('should validate a valid transaction', () => {
      const validData = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Grocery shopping',
        amount: 150.50,
        type: 'expense' as const,
        category: 'Food',
        merchant: 'Whole Foods',
      }

      const result = createTransactionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require accountId', () => {
      const invalidData = {
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('accountId')
      }
    })

    it('should require description with minimum 3 characters', () => {
      const invalidData = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Ab',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should limit description to 255 characters', () => {
      const longDescription = 'A'.repeat(256)
      const invalidData = {
        accountId: 'acc-123',
        date: new Date(),
        description: longDescription,
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require positive amount', () => {
      const invalidData = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test transaction',
        amount: -50,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should not accept zero amount', () => {
      const invalidData = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test transaction',
        amount: 0,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate transaction types', () => {
      const types = ['income', 'expense', 'transfer'] as const

      types.forEach(type => {
        const data = {
          accountId: 'acc-123',
          date: new Date(),
          description: 'Test',
          amount: 100,
          type,
          category: 'Test',
        }

        const result = createTransactionSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid transaction type', () => {
      const invalidData = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'invalid_type',
        category: 'Test',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require category', () => {
      const invalidData = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: '',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept optional merchant', () => {
      const dataWithMerchant = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
        merchant: 'Test Store',
      }

      const dataWithoutMerchant = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
      }

      expect(createTransactionSchema.safeParse(dataWithMerchant).success).toBe(true)
      expect(createTransactionSchema.safeParse(dataWithoutMerchant).success).toBe(true)
    })

    it('should accept optional notes', () => {
      const dataWithNotes = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
        notes: 'Some additional notes',
      }

      const result = createTransactionSchema.safeParse(dataWithNotes)
      expect(result.success).toBe(true)
    })

    it('should coerce string date to Date object', () => {
      const data = {
        accountId: 'acc-123',
        date: '2025-11-03',
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date)
      }
    })
  })

  describe('updateTransactionSchema', () => {
    it('should validate a valid update', () => {
      const validData = {
        description: 'Updated description',
        amount: 200,
      }

      const result = updateTransactionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make all fields optional', () => {
      const partialUpdates = [
        { description: 'New description' },
        { amount: 150 },
        { category: 'New Category' },
        { merchant: 'New Merchant' },
        { notes: 'New notes' },
      ]

      partialUpdates.forEach(update => {
        const result = updateTransactionSchema.safeParse(update)
        expect(result.success).toBe(true)
      })
    })

    it('should still enforce validation rules when fields are provided', () => {
      const invalidUpdates = [
        { description: 'Ab' }, // Too short
        { amount: -50 }, // Negative
        { amount: 0 }, // Zero
      ]

      invalidUpdates.forEach(update => {
        const result = updateTransactionSchema.safeParse(update)
        expect(result.success).toBe(false)
      })
    })

    it('should accept empty object', () => {
      const result = updateTransactionSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate multiple fields together', () => {
      const data = {
        description: 'Updated transaction',
        amount: 300,
        category: 'Updated Category',
        merchant: 'Updated Merchant',
      }

      const result = updateTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for createTransaction', () => {
      const data = {
        accountId: 'acc-123',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        category: 'Food',
      }

      const result = createTransactionSchema.parse(data)

      // TypeScript should infer the correct type
      expect(result.accountId).toBe('acc-123')
      expect(result.description).toBe('Test')
      expect(result.amount).toBe(100)
      expect(result.type).toBe('expense')
    })

    it('should infer correct type for updateTransaction', () => {
      const data = {
        description: 'Updated',
        amount: 200,
      }

      const result = updateTransactionSchema.parse(data)

      // TypeScript should infer the correct type
      expect(result.description).toBe('Updated')
      expect(result.amount).toBe(200)
    })
  })
})
