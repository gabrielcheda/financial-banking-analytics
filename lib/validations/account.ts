import { z } from 'zod'

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long'),
  type: z.enum(['checking', 'savings', 'credit', 'investment']),
  balance: z.number().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD)'),
  accountNumber: z.string().optional(),
  institution: z.string().optional(),
})

export const updateAccountSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  isActive: z.boolean().optional(),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
