import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  getPasswordStrength,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth'

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a valid registration', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
        expect(result.data.defaultCurrency).toBe('USD')
      }
    })

    it('should require first name with minimum 2 characters', () => {
      const invalidData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters')
      }
    })

    it('should limit first name to 50 characters', () => {
      const invalidData = {
        firstName: 'a'.repeat(51),
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too long')
      }
    })

    it('should only allow letters in first name', () => {
      const invalidData = {
        firstName: 'John123',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('only contain letters')
      }
    })

    it('should require last name with minimum 2 characters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require valid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email')
      }
    })

    it('should convert email to lowercase', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
      }
    })

    it('should require password with minimum 8 characters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters')
      }
    })

    it('should limit password to 100 characters', () => {
      const longPassword = 'A'.repeat(50) + 'a'.repeat(50) + '1!@'
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: longPassword,
        confirmPassword: longPassword,
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require password with uppercase, lowercase, number and special character', () => {
      const testCases = [
        { password: 'password123!', desc: 'no uppercase' },
        { password: 'PASSWORD123!', desc: 'no lowercase' },
        { password: 'Password!', desc: 'no number' },
        { password: 'Password123', desc: 'no special character' },
      ]

      testCases.forEach(({ password }) => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password,
          confirmPassword: password,
          termsAccepted: true,
        }

        const result = registerSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    it('should require matching passwords', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPass123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("don't match")
      }
    })

    it('should require terms acceptance', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: false,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('accept the terms')
      }
    })

    it('should accept optional marketing opt-in', () => {
      const validDataWithMarketing = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
        marketingOptIn: true,
      }

      const result = registerSchema.safeParse(validDataWithMarketing)
      expect(result.success).toBe(true)
    })

    it('should set default currency to USD', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.defaultCurrency).toBe('USD')
      }
    })

    it('should accept custom default currency', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
        defaultCurrency: 'EUR',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.defaultCurrency).toBe('EUR')
      }
    })
  })

  describe('loginSchema', () => {
    it('should validate a valid login', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email is required')
      }
    })

    it('should require valid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email')
      }
    })

    it('should convert email to lowercase', () => {
      const validData = {
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
      }
    })

    it('should require password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password is required')
      }
    })

    it('should accept optional rememberMe', () => {
      const validDataWithRemember = {
        email: 'john@example.com',
        password: 'password123',
        rememberMe: true,
      }

      const validDataWithoutRemember = {
        email: 'john@example.com',
        password: 'password123',
      }

      expect(loginSchema.safeParse(validDataWithRemember).success).toBe(true)
      expect(loginSchema.safeParse(validDataWithoutRemember).success).toBe(true)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate a valid forgot password request', () => {
      const validData = {
        email: 'john@example.com',
      }

      const result = forgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require email', () => {
      const invalidData = {
        email: '',
      }

      const result = forgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email is required')
      }
    })

    it('should require valid email format', () => {
      const invalidData = {
        email: 'invalid-email',
      }

      const result = forgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should convert email to lowercase', () => {
      const validData = {
        email: 'JOHN@EXAMPLE.COM',
      }

      const result = forgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
      }
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate a valid password reset', () => {
      const validData = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      }

      const result = resetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require password with minimum 8 characters', () => {
      const invalidData = {
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require password complexity', () => {
      const invalidData = {
        password: 'password',
        confirmPassword: 'password',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require matching passwords', () => {
      const invalidData = {
        password: 'Password123!',
        confirmPassword: 'DifferentPass123!',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("don't match")
      }
    })

    it('should limit password to 100 characters', () => {
      const longPassword = 'A'.repeat(50) + 'a'.repeat(50) + '1!@'
      const invalidData = {
        password: longPassword,
        confirmPassword: longPassword,
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('getPasswordStrength', () => {
    it('should return weak for empty password', () => {
      const result = getPasswordStrength('')
      expect(result.label).toBe('Weak')
      expect(result.score).toBe(0)
      expect(result.color).toBe('bg-red-500')
    })

    it('should return fair for short password with complexity', () => {
      const result = getPasswordStrength('Pass1!')
      // Score: lowercase(1) + uppercase(1) + number(1) + special(1) = 4 = Fair
      expect(result.label).toBe('Fair')
      expect(result.color).toBe('bg-yellow-500')
    })

    it('should return fair for medium complexity', () => {
      const result = getPasswordStrength('password123')
      expect(result.label).toBe('Fair')
      expect(result.color).toBe('bg-yellow-500')
    })

    it('should return fair for password without special chars', () => {
      const result = getPasswordStrength('Password123')
      // Score: length>=8(1) + lowercase(1) + uppercase(1) + number(1) = 4 = Fair
      expect(result.label).toBe('Fair')
      expect(result.color).toBe('bg-yellow-500')
    })

    it('should return strong for high complexity', () => {
      const result = getPasswordStrength('Password123!@#')
      expect(result.label).toBe('Strong')
      expect(result.color).toBe('bg-green-500')
    })

    it('should reward length', () => {
      const short = getPasswordStrength('Pass1!')
      const long = getPasswordStrength('Password1!@#')
      expect(long.score).toBeGreaterThan(short.score)
    })

    it('should reward character variety', () => {
      const simple = getPasswordStrength('password')
      const complex = getPasswordStrength('Pass123!@#')
      expect(complex.score).toBeGreaterThan(simple.score)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct type for register', () => {
      const data: RegisterInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }

      const result = registerSchema.parse(data)
      expect(result.firstName).toBe('John')
      expect(result.lastName).toBe('Doe')
    })

    it('should infer correct type for login', () => {
      const data: LoginInput = {
        email: 'john@example.com',
        password: 'password123',
      }

      const result = loginSchema.parse(data)
      expect(result.email).toBe('john@example.com')
    })

    it('should infer correct type for forgot password', () => {
      const data: ForgotPasswordInput = {
        email: 'john@example.com',
      }

      const result = forgotPasswordSchema.parse(data)
      expect(result.email).toBe('john@example.com')
    })

    it('should infer correct type for reset password', () => {
      const data: ResetPasswordInput = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      }

      const result = resetPasswordSchema.parse(data)
      expect(result.password).toBe('NewPassword123!')
    })
  })
})
