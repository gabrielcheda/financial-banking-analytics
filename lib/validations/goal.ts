import { z } from 'zod'

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  targetAmount: z
    .number()
    .positive('Target amount must be positive')
    .or(z.string().transform((val) => parseFloat(val))),
  currentAmount: z
    .number()
    .min(0, 'Current amount cannot be negative')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional()
    .default(0),
  deadline: z.coerce.date(),
  categoryId: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
  linkedAccountId: z.string().optional(),
  monthlyContribution: z
    .number()
    .min(0, 'Monthly contribution cannot be negative')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
})

export const updateGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  targetAmount: z
    .number()
    .positive('Target amount must be positive')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  currentAmount: z
    .number()
    .min(0, 'Current amount cannot be negative')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  deadline: z.coerce.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  linkedAccountId: z.string().optional(),
  monthlyContribution: z
    .number()
    .min(0, 'Monthly contribution cannot be negative')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
})

export const contributeToGoalSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val))),
  date: z.coerce.date(),
  accountId: z.string().min(1, 'Account is required'),
  notes: z.string().max(500, 'Notes are too long').optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type ContributeToGoalInput = z.infer<typeof contributeToGoalSchema>
