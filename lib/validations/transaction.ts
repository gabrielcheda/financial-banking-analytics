/**
 * Transaction Validation Schemas
 */

import { z } from 'zod'

// Location schema
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

// Attachment schema
export const attachmentSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileType: z.string(),
  fileSize: z.number(),
  uploadedAt: z.coerce.date(),
})

// Metadata schema
export const metadataSchema = z.object({
  source: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

// Base Transaction Schema - matches backend DTO
const baseTransactionSchema = z.object({
  accountId: z.string().uuid({ message: 'Please select a valid account' }),
  toAccountId: z
    .string()
    .uuid({ message: 'Please select a valid destination account' })
    .optional()
    .or(z.literal('')),
  categoryId: z.string().uuid({ message: 'Please select a valid category' }),
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date',
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description must be less than 255 characters'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .min(0.01, 'Amount must be at least 0.01'),
  type: z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Transaction type is required',
  }),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  merchant: z.string().max(255).optional(),
  merchantId: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(attachmentSchema).optional(),
  metadata: metadataSchema.optional(),
})

// Create Transaction Schema with custom validations
export const createTransactionSchema = baseTransactionSchema.refine(
  (data) => data.type !== 'transfer' || !!data.toAccountId,
  {
    message: 'Destination account is required for transfer transactions',
    path: ['toAccountId'],
  }
).refine(
  (data) => data.type !== 'transfer' || data.accountId !== data.toAccountId,
  {
    message: 'Destination account must be different from the source account',
    path: ['toAccountId'],
  }
)

// Update Transaction Schema
export const updateTransactionSchema = baseTransactionSchema.partial()

// Export inferred types
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type LocationInput = z.infer<typeof locationSchema>
export type AttachmentInput = z.infer<typeof attachmentSchema>
export type MetadataInput = z.infer<typeof metadataSchema>
