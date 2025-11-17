'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBillSchema, updateBillSchema, type CreateBillInput, type UpdateBillInput } from '@/lib/validations/bill'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { format } from 'date-fns'
import { useState } from 'react'
import { parseLocaleInteger, parseLocaleNumber } from '@/lib/numberUtils'

interface BillFormProps {
  onSubmit: (data: CreateBillInput | UpdateBillInput) => Promise<void> | void
  onCancel?: () => void
  defaultValues?: Partial<CreateBillInput>
  isLoading?: boolean
  isEditing?: boolean
}

export function BillForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  isEditing = false,
}: BillFormProps) {
  const [enableReminder, setEnableReminder] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateBillInput>({
    resolver: zodResolver(isEditing ? updateBillSchema : createBillSchema),
    defaultValues: {
      isRecurring: false,
      reminders: [{ enabled: false, daysBefore: 3 }],
      ...defaultValues,
    },
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    type: 'expense',
    isActive: true,
  })
  const { data: accountsData, isLoading: accountsLoading } = useActiveAccounts()

  const categories = categoriesData || []
  const accounts = accountsData || []
  const isRecurring = watch('isRecurring')

  const handleFormSubmit = async (data: CreateBillInput) => {
    // Process data before submitting
    const processedData = {
      ...data,
      reminders: enableReminder ? data.reminders : undefined,
    }
    await onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Bill Name */}
      {!isEditing && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Bill Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            placeholder="e.g. Electricity, Internet, Rent"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>
      )}

      {/* Amount */}
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
            type="text"
            id="amount"
            inputMode="decimal"
            {...register('amount', { setValueAs: parseLocaleNumber })}
            placeholder="0,00"
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Category & Account Selection */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payment Account <span className="text-red-500">*</span>
            </label>
            <select
              id="accountId"
              {...register('accountId')}
              disabled={accountsLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.accountNumber}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.accountId.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Due Date */}
      {!isEditing && (
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate', { valueAsDate: true })}
            defaultValue={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.dueDate.message}
            </p>
          )}
        </div>
      )}

      {/* Recurring Section */}
      {!isEditing && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recurring Bill
          </h3>

          {/* Enable Recurring Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This is a recurring bill
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically create next bill after payment
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isRecurring"
                {...register('isRecurring')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Frequency Selection */}
          {isRecurring && (
            <div>
              <label
                htmlFor="frequency"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                id="frequency"
                {...register('frequency')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.frequency.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reminders Section */}
      {!isEditing && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Reminders
          </h3>

          {/* Enable Reminder Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <label htmlFor="enableReminder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Payment Reminders
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get notified before the bill is due
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="enableReminder"
                checked={enableReminder}
                onChange={(e) => setEnableReminder(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Days Before Input */}
          {enableReminder && (
            <div>
              <label
                htmlFor="reminderDays"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Remind me (days before due date)
              </label>
              <input
                type="text"
                id="reminderDays"
                inputMode="numeric"
                {...register('reminders.0.daysBefore', { setValueAs: parseLocaleInteger })}
                defaultValue={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You'll receive a notification this many days before the bill is due
              </p>
              {errors.reminders?.[0]?.daysBefore && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.reminders[0].daysBefore.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {!isEditing && (
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            placeholder="Add any additional notes about this bill..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.notes.message}
            </p>
          )}
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
          disabled={isSubmitting || isLoading || categoriesLoading || accountsLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isSubmitting || isLoading ? 'Saving...' : isEditing ? 'Update Bill' : 'Create Bill'}
        </Button>
      </div>
    </form>
  )
}
