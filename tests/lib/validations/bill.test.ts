import { describe, it, expect } from 'vitest'
import {
  createBillSchema,
  updateBillSchema,
  payBillSchema,
  type CreateBillInput,
  type UpdateBillInput,
  type PayBillInput,
} from '@/lib/validations/bill'

describe('Bill Validation Schemas', () => {
  describe('createBillSchema', () => {
    it('should validate a valid bill', () => {
      const validData = {
        name: 'Electric Bill',
        amount: 150.50,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
        isRecurring: false,
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require bill name', () => {
      const invalidData = {
        name: '',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('name is required')
      }
    })

    it('should require positive amount', () => {
      const invalidData = {
        name: 'Bill',
        amount: -50,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('must be positive')
      }
    })

    it('should not accept zero amount', () => {
      const invalidData = {
        name: 'Bill',
        amount: 0,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string amount and transform to number', () => {
      const validData = {
        name: 'Bill',
        amount: '150.75',
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.amount).toBe('number')
        expect(result.data.amount).toBe(150.75)
      }
    })

    it('should require merchantId', () => {
      const invalidData = {
        name: 'Bill',
        amount: 150,
        merchantId: '',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Merchant is required')
      }
    })

    it('should require categoryId', () => {
      const invalidData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: '',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Category is required')
      }
    })

    it('should require accountId', () => {
      const invalidData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: '',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Account is required')
      }
    })

    it('should require dueDate', () => {
      const invalidData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '',
      }

      const result = createBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Due date is required')
      }
    })

    it('should set default isRecurring to false', () => {
      const validData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isRecurring).toBe(false)
      }
    })

    it('should accept optional frequency', () => {
      const validData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
        isRecurring: true,
        frequency: 'monthly' as const,
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate frequency enum values', () => {
      const frequencies = ['monthly', 'weekly', 'yearly'] as const

      frequencies.forEach(frequency => {
        const validData = {
          name: 'Bill',
          amount: 150,
          merchantId: 'merchant-123',
          categoryId: 'cat-123',
          accountId: 'acc-123',
          dueDate: '2024-01-15',
          frequency,
        }

        const result = createBillSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('should accept optional reminders', () => {
      const validData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
        reminders: [
          { enabled: true, daysBefore: 7 },
          { enabled: true, daysBefore: 1 },
        ],
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept optional notes', () => {
      const validData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
        notes: 'Pay before the 15th',
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('updateBillSchema', () => {
    it('should validate a valid update', () => {
      const validData = {
        amount: 200,
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make all fields optional', () => {
      const emptyUpdate = {}
      const result = updateBillSchema.safeParse(emptyUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate amount when provided', () => {
      const invalidData = {
        amount: -100,
      }

      const result = updateBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string amount and transform to number', () => {
      const validData = {
        amount: '250.50',
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.amount).toBe('number')
        expect(result.data.amount).toBe(250.50)
      }
    })

    it('should accept isPaid update', () => {
      const validData = {
        isPaid: true,
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept merchantId update', () => {
      const validData = {
        merchantId: 'new-merchant-123',
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept categoryId update', () => {
      const validData = {
        categoryId: 'new-cat-123',
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept paymentDate update', () => {
      const validData = {
        paymentDate: '2024-01-20',
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept multiple fields together', () => {
      const validData = {
        amount: 175,
        isPaid: true,
        paymentDate: '2024-01-18',
      }

      const result = updateBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('payBillSchema', () => {
    it('should validate a valid payment', () => {
      const validData = {
        paymentDate: new Date('2024-01-15'),
        accountId: 'acc-123',
      }

      const result = payBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require accountId', () => {
      const invalidData = {
        paymentDate: new Date(),
        accountId: '',
      }

      const result = payBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Account is required')
      }
    })

    it('should coerce string date to Date object', () => {
      const validData = {
        paymentDate: '2024-01-15',
        accountId: 'acc-123',
      }

      const result = payBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentDate).toBeInstanceOf(Date)
      }
    })

    it('should accept optional amount', () => {
      const validData = {
        paymentDate: new Date(),
        amount: 150.50,
        accountId: 'acc-123',
      }

      const result = payBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate amount when provided', () => {
      const invalidData = {
        paymentDate: new Date(),
        amount: -50,
        accountId: 'acc-123',
      }

      const result = payBillSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept string amount and transform to number', () => {
      const validData = {
        paymentDate: new Date(),
        amount: '150.75',
        accountId: 'acc-123',
      }

      const result = payBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.amount).toBe('number')
        expect(result.data.amount).toBe(150.75)
      }
    })

    it('should accept optional notes', () => {
      const validData = {
        paymentDate: new Date(),
        accountId: 'acc-123',
        notes: 'Paid online',
      }

      const result = payBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for createBill', () => {
      const data: CreateBillInput = {
        name: 'Electric Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.parse(data)
      expect(result.name).toBe('Electric Bill')
      expect(result.amount).toBe(150)
    })

    it('should infer correct type for updateBill', () => {
      const data: UpdateBillInput = {
        amount: 200,
        isPaid: true,
      }

      const result = updateBillSchema.parse(data)
      expect(result.amount).toBe(200)
      expect(result.isPaid).toBe(true)
    })

    it('should infer correct type for payBill', () => {
      const data: PayBillInput = {
        paymentDate: new Date(),
        accountId: 'acc-123',
      }

      const result = payBillSchema.parse(data)
      expect(result.accountId).toBe('acc-123')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const validData = {
        name: 'Large Bill',
        amount: 999999.99,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle decimal amounts', () => {
      const validData = {
        name: 'Bill',
        amount: 123.456,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(123.456)
      }
    })

    it('should handle empty reminders array', () => {
      const validData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
        reminders: [],
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle multiple reminders', () => {
      const validData = {
        name: 'Bill',
        amount: 150,
        merchantId: 'merchant-123',
        categoryId: 'cat-123',
        accountId: 'acc-123',
        dueDate: '2024-01-15',
        reminders: [
          { enabled: true, daysBefore: 30 },
          { enabled: true, daysBefore: 7 },
          { enabled: true, daysBefore: 1 },
          { enabled: false, daysBefore: 0 },
        ],
      }

      const result = createBillSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.reminders).toHaveLength(4)
      }
    })
  })
})
