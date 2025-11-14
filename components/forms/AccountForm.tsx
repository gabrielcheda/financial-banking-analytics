'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAccountSchema, type CreateAccountInput } from '@/lib/validations/account'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface AccountFormProps {
  onSubmit: (data: CreateAccountInput) => Promise<void> | void
  onCancel?: () => void
  defaultValues?: Partial<CreateAccountInput>
  isLoading?: boolean
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment Account' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
]

export function AccountForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      type: 'checking',
      currency: 'USD',
      balance: 0,
      ...defaultValues,
    },
  })

  const handleFormSubmit = async (data: CreateAccountInput) => {
    try {
      await onSubmit(data)
      toast.success('Account saved successfully')
      reset()
    } catch (error) {
      console.error('Account form error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Account Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Account Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          placeholder="e.g., Main Checking Account"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Account Type & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Account Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            {...register('type')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.type.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            id="currency"
            {...register('currency')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.currency.message}
            </p>
          )}
        </div>
      </div>

      {/* Balance */}
      <div>
        <label
          htmlFor="balance"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Current Balance
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            $
          </span>
          <input
            type="number"
            id="balance"
            step="0.01"
            {...register('balance', { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.balance && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.balance.message}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter the current balance for this account (optional)
        </p>
      </div>

      {/* Institution (Optional) */}
      <div>
        <label
          htmlFor="institution"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Financial Institution (Optional)
        </label>
        <input
          type="text"
          id="institution"
          {...register('institution')}
          placeholder="e.g., Bank of America"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.institution && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.institution.message}
          </p>
        )}
      </div>

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
          {isSubmitting || isLoading ? 'Saving...' : 'Save Account'}
        </Button>
      </div>
    </form>
  )
}
