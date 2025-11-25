import { describe, it, expect } from 'vitest'
import {
  createAccountSchema,
  updateAccountSchema,
} from '@/lib/validations/account'

describe('Account Validation Schemas', () => {
  describe('createAccountSchema', () => {
    it('should validate a valid account', () => {
      const validData = {
        name: 'Main Checking',
        type: 'checking' as const,
        currency: 'USD',
        balance: 5000,
        institution: 'Bank of America',
      }

      const result = createAccountSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require name with minimum 3 characters', () => {
      const invalidData = {
        name: 'AB',
        type: 'checking' as const,
        currency: 'USD',
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 3 characters')
      }
    })

    it('should limit name to 100 characters', () => {
      const longName = 'A'.repeat(101)
      const invalidData = {
        name: longName,
        type: 'checking' as const,
        currency: 'USD',
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('too long')
      }
    })

    it('should validate all four account types', () => {
      const types = ['checking', 'savings', 'credit', 'investment'] as const

      types.forEach(type => {
        const data = {
          name: 'Test Account',
          type,
          currency: 'USD',
        }

        const result = createAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid account type', () => {
      const invalidData = {
        name: 'Test Account',
        type: 'invalid_type',
        currency: 'USD',
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require currency with exactly 3 characters', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'BRL', 'JPY']

      validCurrencies.forEach(currency => {
        const data = {
          name: 'Test Account',
          type: 'checking' as const,
          currency,
        }

        const result = createAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject currency with less than 3 characters', () => {
      const invalidData = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'US',
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('3 characters')
      }
    })

    it('should reject currency with more than 3 characters', () => {
      const invalidData = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USDA',
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('3 characters')
      }
    })

    it('should accept optional balance', () => {
      const dataWithBalance = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
      }

      const dataWithoutBalance = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
      }

      expect(createAccountSchema.safeParse(dataWithBalance).success).toBe(true)
      expect(createAccountSchema.safeParse(dataWithoutBalance).success).toBe(true)
    })

    it('should accept zero balance', () => {
      const dataWithZeroBalance = {
        name: 'New Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 0,
      }

      const result = createAccountSchema.safeParse(dataWithZeroBalance)
      expect(result.success).toBe(true)
    })

    it('should accept negative balance', () => {
      const dataWithNegativeBalance = {
        name: 'Credit Card',
        type: 'credit' as const,
        currency: 'USD',
        balance: -500,
      }

      const result = createAccountSchema.safeParse(dataWithNegativeBalance)
      expect(result.success).toBe(true)
    })

    it('should accept optional institution', () => {
      const dataWithInstitution = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        institution: 'Chase Bank',
      }

      const dataWithoutInstitution = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
      }

      expect(createAccountSchema.safeParse(dataWithInstitution).success).toBe(true)
      expect(createAccountSchema.safeParse(dataWithoutInstitution).success).toBe(true)
    })

    it('should accept optional accountNumber', () => {
      const dataWithAccountNumber = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        accountNumber: '123456789',
      }

      const dataWithoutAccountNumber = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
      }

      expect(createAccountSchema.safeParse(dataWithAccountNumber).success).toBe(true)
      expect(createAccountSchema.safeParse(dataWithoutAccountNumber).success).toBe(true)
    })

    it('should accept decimal balances', () => {
      const data = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1234.56,
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.balance).toBe(1234.56)
      }
    })

    it('should require name field', () => {
      const data = {
        type: 'checking' as const,
        currency: 'USD',
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should require type field', () => {
      const data = {
        name: 'Test Account',
        currency: 'USD',
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should require currency field', () => {
      const data = {
        name: 'Test Account',
        type: 'checking',
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('updateAccountSchema', () => {
    it('should validate a valid update', () => {
      const validData = {
        name: 'Updated Account Name',
        isActive: true,
      }

      const result = updateAccountSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make all fields optional', () => {
      const partialUpdates = [
        { name: 'New Name' },
        { isActive: true },
        { isActive: false },
      ]

      partialUpdates.forEach(update => {
        const result = updateAccountSchema.safeParse(update)
        expect(result.success).toBe(true)
      })
    })

    it('should enforce name minimum length when provided', () => {
      const invalidUpdate = {
        name: 'AB', // Too short (less than 3)
      }

      const result = updateAccountSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })

    it('should enforce name maximum length when provided', () => {
      const invalidUpdate = {
        name: 'A'.repeat(101), // Too long
      }

      const result = updateAccountSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })

    it('should accept empty object', () => {
      const result = updateAccountSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate multiple fields together', () => {
      const data = {
        name: 'Updated Account',
        isActive: false,
      }

      const result = updateAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept true for isActive', () => {
      const data = {
        isActive: true,
      }

      const result = updateAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept false for isActive', () => {
      const data = {
        isActive: false,
      }

      const result = updateAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for createAccount', () => {
      const data = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 5000,
      }

      const result = createAccountSchema.parse(data)

      // TypeScript should infer the correct type
      expect(result.name).toBe('Test Account')
      expect(result.type).toBe('checking')
      expect(result.currency).toBe('USD')
      expect(result.balance).toBe(5000)
    })

    it('should infer correct type for updateAccount', () => {
      const data = {
        name: 'Updated Name',
        isActive: true,
      }

      const result = updateAccountSchema.parse(data)

      // TypeScript should infer the correct type
      expect(result.name).toBe('Updated Name')
      expect(result.isActive).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large balances', () => {
      const data = {
        name: 'Investment Account',
        type: 'investment' as const,
        currency: 'USD',
        balance: 999999999.99,
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle very small positive balances', () => {
      const data = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 0.01,
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle special characters in name', () => {
      const data = {
        name: "John's Checking & Savings",
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle very large negative balances', () => {
      const data = {
        name: 'Credit Line',
        type: 'credit' as const,
        currency: 'USD',
        balance: -999999999.99,
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})
