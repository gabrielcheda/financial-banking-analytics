import { z } from 'zod'

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  limit: z
    .number()
    .positive('Budget limit must be positive')
    .or(z.string().transform((val) => parseFloat(val))),
  period: z.enum(['monthly', 'yearly'], {
    required_error: 'Period is required',
  }),
  startDate: z.coerce.date(),
  alerts: z.object({
    enabled: z.boolean().default(true),
    threshold: z
      .number()
      .min(0, 'Threshold must be at least 0')
      .max(100, 'Threshold cannot exceed 100')
      .default(80),
  }).optional(),
})

export const updateBudgetSchema = z.object({
  limit: z
    .number()
    .positive('Budget limit must be positive')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  alerts: z.object({
    enabled: z.boolean(),
    threshold: z
      .number()
      .min(0, 'Threshold must be at least 0')
      .max(100, 'Threshold cannot exceed 100'),
  }).optional(),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
