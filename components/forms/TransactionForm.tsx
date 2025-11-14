'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransactionSchema, type CreateTransactionInput } from '@/lib/validations/transaction'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { useMerchants } from '@/hooks/useMerchants'
import { toast } from 'sonner'

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<CreateTransactionInput>
  isLoading?: boolean
  isEditing?: boolean
}

export function TransactionForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  isEditing = false,
}: TransactionFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(defaultValues?.tags || [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'expense',
      status: 'completed',
      date: new Date(),
      ...defaultValues,
      tags: defaultValues?.tags || [],
    },
  })

  const transactionType = watch('type')

  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories()
  const { data: accountsData = [], isLoading: accountsLoading } = useActiveAccounts()
  const { data: merchantsData = [], isLoading: merchantsLoading } = useMerchants()

  // Filter categories based on transaction type
  const filteredCategories = categoriesData.filter((cat) => {
    if (transactionType === 'income') {
      return cat.type === 'income'
    } else if (transactionType === 'expense') {
      return cat.type === 'expense'
    }
    return true
  })

  const handleFormSubmit = async (data: CreateTransactionInput) => {
    try {
      // Keep tags synchronized
      const submitData = {
        ...data,
        tags: tags.length > 0 ? tags : undefined,
      }

      await onSubmit(submitData)
      toast.success(isEditing ? 'Transaction updated successfully' : 'Transaction created successfully')
    } catch (error) {
      console.error('Transaction form error:', error)
      // Error toast is handled by the parent component via error-utils
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Transaction Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label
            className={`relative flex cursor-pointer rounded-lg border p-3 sm:p-4 focus:outline-none transition-all ${
              transactionType === 'income'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <input type="radio" {...register('type')} value="income" className="sr-only" />
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Income
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Money in</span>
            </div>
          </label>

          <label
            className={`relative flex cursor-pointer rounded-lg border p-3 sm:p-4 focus:outline-none transition-all ${
              transactionType === 'expense'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <input type="radio" {...register('type')} value="expense" className="sr-only" />
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Expense
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Money out</span>
            </div>
          </label>

          <label
            className={`relative flex cursor-pointer rounded-lg border p-3 sm:p-4 focus:outline-none transition-all ${
              transactionType === 'transfer'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <input type="radio" {...register('type')} value="transfer" className="sr-only" />
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Transfer
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Between accounts</span>
            </div>
          </label>
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="description"
          {...register('description')}
          placeholder="e.g., Grocery shopping at Whole Foods"
          maxLength={255}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Amount & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                id="date"
                value={
                  field.value instanceof Date
                    ? field.value.toISOString().split('T')[0]
                    : field.value
                    ? new Date(field.value).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Account & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="accountId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Account <span className="text-red-500">*</span>
          </label>
          <select
            id="accountId"
            {...register('accountId')}
            disabled={accountsLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select an account</option>
            {accountsData.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.accountId.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={categoriesLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select a category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon && `${cat.icon} `}
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      {/* Status & Merchant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="merchantId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Merchant
          </label>
          <select
            id="merchantId"
            {...register('merchantId')}
            disabled={merchantsLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No merchant selected</option>
            {merchantsData.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.icon && `${merchant.icon} `}{merchant.name}
              </option>
            ))}
          </select>
          {errors.merchantId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.merchantId.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          placeholder="Add any additional notes..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Tags
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tag and press Enter"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" variant="outline" onClick={handleAddTag} size="sm">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags.message}</p>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Location removed - now managed through Merchants */}

          {/* Metadata */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Metadata</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="source"
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Source
                </label>
                <input
                  type="text"
                  id="source"
                  {...register('metadata.source')}
                  placeholder="e.g., web, mobile_app, import"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="ipAddress"
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  IP Address
                </label>
                <input
                  type="text"
                  id="ipAddress"
                  {...register('metadata.ipAddress')}
                  placeholder="e.g., 192.168.1.1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="userAgent"
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  User Agent
                </label>
                <input
                  type="text"
                  id="userAgent"
                  {...register('metadata.userAgent')}
                  placeholder="Browser/device information"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Attachments Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> File attachments are not yet implemented in this form. They will
              be added in a future update.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isSubmitting || isLoading
            ? 'Saving...'
            : isEditing
            ? 'Update Transaction'
            : 'Create Transaction'}
        </Button>
      </div>
    </form>
  )
}
