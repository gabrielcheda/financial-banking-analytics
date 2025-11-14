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

    it('should require name with minimum 2 characters', () => {
      const invalidData = {
        name: 'A',
        type: 'checking' as const,
        currency: 'USD',
        balance: 5000,
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should limit name to 100 characters', () => {
      const longName = 'A'.repeat(101)
      const invalidData = {
        name: longName,
        type: 'checking' as const,
        currency: 'USD',
        balance: 5000,
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate account types', () => {
      const types = ['checking', 'savings', 'credit_card', 'investment', 'loan', 'other'] as const

      types.forEach(type => {
        const data = {
          name: 'Test Account',
          type,
          currency: 'USD',
          balance: 1000,
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
        balance: 1000,
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'BRL', 'JPY', 'CAD', 'AUD', 'CHF']

      currencies.forEach(currency => {
        const data = {
          name: 'Test Account',
          type: 'checking' as const,
          currency,
          balance: 1000,
        }

        const result = createAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid currency code', () => {
      const invalidData = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'XYZ',
        balance: 1000,
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept negative balance', () => {
      const dataWithNegativeBalance = {
        name: 'Credit Card',
        type: 'credit_card' as const,
        currency: 'USD',
        balance: -500,
      }

      const result = createAccountSchema.safeParse(dataWithNegativeBalance)
      expect(result.success).toBe(true)
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

    it('should accept optional institution', () => {
      const dataWithInstitution = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
        institution: 'Chase Bank',
      }

      const dataWithoutInstitution = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
      }

      expect(createAccountSchema.safeParse(dataWithInstitution).success).toBe(true)
      expect(createAccountSchema.safeParse(dataWithoutInstitution).success).toBe(true)
    })

    it('should accept optional description', () => {
      const dataWithDescription = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
        description: 'My personal checking account',
      }

      const result = createAccountSchema.safeParse(dataWithDescription)
      expect(result.success).toBe(true)
    })

    it('should limit description to 500 characters', () => {
      const longDescription = 'A'.repeat(501)
      const invalidData = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
        description: longDescription,
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should limit institution to 100 characters', () => {
      const longInstitution = 'A'.repeat(101)
      const invalidData = {
        name: 'Test Account',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
        institution: longInstitution,
      }

      const result = createAccountSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
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
    })
  })

  describe('updateAccountSchema', () => {
    it('should validate a valid update', () => {
      const validData = {
        name: 'Updated Account Name',
        balance: 10000,
      }

      const result = updateAccountSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make all fields optional', () => {
      const partialUpdates = [
        { name: 'New Name' },
        { balance: 5000 },
        { institution: 'New Bank' },
        { description: 'New description' },
      ]

      partialUpdates.forEach(update => {
        const result = updateAccountSchema.safeParse(update)
        expect(result.success).toBe(true)
      })
    })

    it('should still enforce validation rules when fields are provided', () => {
      const invalidUpdates = [
        { name: 'A' }, // Too short
        { institution: 'A'.repeat(101) }, // Too long
        { description: 'A'.repeat(501) }, // Too long
      ]

      invalidUpdates.forEach(update => {
        const result = updateAccountSchema.safeParse(update)
        expect(result.success).toBe(false)
      })
    })

    it('should accept empty object', () => {
      const result = updateAccountSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate multiple fields together', () => {
      const data = {
        name: 'Updated Account',
        balance: 15000,
        institution: 'New Bank',
        description: 'Updated description',
      }

      const result = updateAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept negative balance in updates', () => {
      const data = {
        balance: -1000,
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
        balance: 10000,
      }

      const result = updateAccountSchema.parse(data)

      // TypeScript should infer the correct type
      expect(result.name).toBe('Updated Name')
      expect(result.balance).toBe(10000)
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

    it('should trim whitespace from strings', () => {
      const data = {
        name: '  Test Account  ',
        type: 'checking' as const,
        currency: 'USD',
        balance: 1000,
        institution: '  Bank Name  ',
      }

      const result = createAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Account')
        expect(result.data.institution).toBe('Bank Name')
      }
    })
  })
})
