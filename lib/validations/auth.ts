import { z } from 'zod'

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name is too long')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name is too long')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    defaultCurrency: z.string().optional().default('USD'),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and conditions'),
    marketingOptIn: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Password strength calculator
export const getPasswordStrength = (password: string): {
  score: number
  label: 'Weak' | 'Fair' | 'Good' | 'Strong'
  color: string
} => {
  let score = 0

  if (!password) return { score: 0, label: 'Weak', color: 'bg-red-500' }

  // Length
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Contains lowercase
  if (/[a-z]/.test(password)) score += 1

  // Contains uppercase
  if (/[A-Z]/.test(password)) score += 1

  // Contains numbers
  if (/\d/.test(password)) score += 1

  // Contains special characters
  if (/[@$!%*?&]/.test(password)) score += 1

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score <= 5) return { score, label: 'Good', color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-green-500' }
}
