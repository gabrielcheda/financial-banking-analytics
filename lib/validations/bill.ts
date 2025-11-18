import { z } from 'zod'

export const createBillSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val))),
  categoryId: z.string().min(1, 'Category is required'),
  accountId: z.string().min(1, 'Account is required'),
  dueDate: z.coerce.date(),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['monthly', 'weekly', 'yearly']).optional(),
  reminders: z.array(z.object({
    enabled: z.boolean(),
    daysBefore: z.number().int().min(0),
  })).optional(),
  notes: z.string().optional(),
})

export const updateBillSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  isPaid: z.boolean().optional(),
  paymentDate: z.coerce.date().optional(),
})

export const payBillSchema = z.object({
  paymentDate: z.coerce.date(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  accountId: z.string().min(1, 'Account is required'),
  notes: z.string().optional(),
})

export type CreateBillInput = z.infer<typeof createBillSchema>
export type UpdateBillInput = z.infer<typeof updateBillSchema>
export type PayBillInput = z.infer<typeof payBillSchema>
