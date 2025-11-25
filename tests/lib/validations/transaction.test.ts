import { describe, it, expect } from 'vitest'
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '@/lib/validations/transaction'

describe('Transaction Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    it('should validate a valid transaction', () => {
      const validData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Grocery shopping',
        amount: 150.50,
        type: 'expense' as const,
        merchant: 'Whole Foods',
      }

      const result = createTransactionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require accountId as UUID', () => {
      const invalidData = {
        accountId: 'invalid-uuid',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('accountId')
      }
    })

    it('should require categoryId as UUID', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: 'invalid-uuid',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('categoryId')
      }
    })

    it('should require description with minimum 1 character', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: '',
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should limit description to 255 characters', () => {
      const longDescription = 'A'.repeat(256)
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: longDescription,
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require positive amount', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test transaction',
        amount: -50,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should not accept zero amount', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test transaction',
        amount: 0,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require minimum amount of 0.01', () => {
      const validData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 0.01,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate transaction types', () => {
      const types = ['income', 'expense', 'transfer'] as const

      types.forEach(type => {
        const data = {
          accountId: '550e8400-e29b-41d4-a716-446655440000',
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          date: new Date(),
          description: 'Test',
          amount: 100,
          type,
          toAccountId: type === 'transfer' ? '550e8400-e29b-41d4-a716-446655440002' : undefined,
        }

        const result = createTransactionSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid transaction type', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'invalid_type',
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require toAccountId for transfer transactions', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Transfer',
        amount: 100,
        type: 'transfer' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('toAccountId')
      }
    })

    it('should reject transfer to same account', () => {
      const accountId = '550e8400-e29b-41d4-a716-446655440000'
      const invalidData = {
        accountId,
        toAccountId: accountId,
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Transfer',
        amount: 100,
        type: 'transfer' as const,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('different')
      }
    })

    it('should accept optional merchant', () => {
      const dataWithMerchant = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        merchant: 'Test Store',
      }

      const dataWithoutMerchant = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
      }

      expect(createTransactionSchema.safeParse(dataWithMerchant).success).toBe(true)
      expect(createTransactionSchema.safeParse(dataWithoutMerchant).success).toBe(true)
    })

    it('should limit merchant to 255 characters', () => {
      const longMerchant = 'A'.repeat(256)
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        merchant: longMerchant,
      }

      const result = createTransactionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept optional notes', () => {
      const dataWithNotes = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        notes: 'Some additional notes',
      }

      const result = createTransactionSchema.safeParse(dataWithNotes)
      expect(result.success).toBe(true)
    })

    it('should coerce string date to Date object', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: '2025-11-03',
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date)
      }
    })

    it('should accept optional status', () => {
      const statuses = ['pending', 'completed', 'cancelled'] as const

      statuses.forEach(status => {
        const data = {
          accountId: '550e8400-e29b-41d4-a716-446655440000',
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          date: new Date(),
          description: 'Test',
          amount: 100,
          type: 'expense' as const,
          status,
        }

        expect(createTransactionSchema.safeParse(data).success).toBe(true)
      })
    })

    it('should accept optional tags array', () => {
      const dataWithTags = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        tags: ['groceries', 'healthy'],
      }

      const result = createTransactionSchema.safeParse(dataWithTags)
      expect(result.success).toBe(true)
    })

    it('should accept empty string for toAccountId', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        toAccountId: '',
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept empty string for merchantId', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
        merchantId: '',
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
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
        { categoryId: '550e8400-e29b-41d4-a716-446655440001' },
        { merchant: 'New Merchant' },
        { notes: 'New notes' },
        { status: 'completed' as const },
      ]

      partialUpdates.forEach(update => {
        const result = updateTransactionSchema.safeParse(update)
        expect(result.success).toBe(true)
      })
    })

    it('should still enforce validation rules when fields are provided', () => {
      const invalidUpdates = [
        { description: '' }, // Empty
        { amount: -50 }, // Negative
        { amount: 0 }, // Zero
        { accountId: 'invalid-uuid' }, // Invalid UUID
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
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        merchant: 'Updated Merchant',
      }

      const result = updateTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for createTransaction', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.parse(data)

      // TypeScript should infer the correct type
      expect(result.accountId).toBe('550e8400-e29b-41d4-a716-446655440000')
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

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Large transaction',
        amount: 999999999.99,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle minimum valid amount', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        date: new Date(),
        description: 'Small transaction',
        amount: 0.01,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should require date field', () => {
      const data = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        description: 'Test',
        amount: 100,
        type: 'expense' as const,
      }

      const result = createTransactionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
