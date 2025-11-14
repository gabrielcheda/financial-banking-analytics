'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contributeToGoalSchema, type ContributeToGoalInput } from '@/lib/validations/goal'
import { Button } from '@/components/ui/Button'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { format } from 'date-fns'
import type { GoalDTO } from '@/types/dto'
import { TrendingUp, DollarSign } from 'lucide-react'

interface ContributeFormProps {
  goal: GoalDTO
  onSubmit: (data: ContributeToGoalInput) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
}

export function ContributeForm({
  goal,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContributeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ContributeToGoalInput>({
    resolver: zodResolver(contributeToGoalSchema),
    defaultValues: {
      date: new Date(),
      accountId: goal.linkedAccountId ?? '',
    },
  })

  const { data: accounts, isLoading: accountsLoading } = useActiveAccounts()

  const contributionAmount = watch('amount')

  const handleFormSubmit = async (data: ContributeToGoalInput) => {
    await onSubmit(data)
  }

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Helper functions to calculate missing properties
  const calculatePercentage = (currentAmount: number, targetAmount: number): number => {
    if (targetAmount === 0) return 0
    return (currentAmount / targetAmount) * 100
  }

  const calculateRemainingAmount = (targetAmount: number, currentAmount: number): number => {
    return Math.max(0, targetAmount - currentAmount)
  }

  const currentPercentage = calculatePercentage(goal.currentAmount, goal.targetAmount)
  const currentRemainingAmount = calculateRemainingAmount(goal.targetAmount, goal.currentAmount)

  // Calculate new progress after contribution
  const newAmount = goal.currentAmount + (contributionAmount || 0)
  const newPercentage = Math.min((newAmount / goal.targetAmount) * 100, 100)
  const newRemaining = Math.max(goal.targetAmount - newAmount, 0)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Current Goal Progress */}
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Current Progress
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current Amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Target Amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Remaining</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(currentRemainingAmount)}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {currentPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(currentPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Contribution Amount <span className="text-red-500">*</span>
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
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Preview of New Progress */}
      {contributionAmount && contributionAmount > 0 && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
              New Progress After Contribution
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 dark:text-green-400">New Amount</span>
              <span className="font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(newAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 dark:text-green-400">New Remaining</span>
              <span className="font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(newRemaining)}
              </span>
            </div>
            <div className="pt-2 border-t border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-green-600 dark:text-green-400">New Progress</span>
                <span className="font-semibold text-green-700 dark:text-green-300">
                  {newPercentage.toFixed(1)}%
                  <span className="ml-2 text-xs">
                    (+{(newPercentage - currentPercentage).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-2 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 dark:bg-green-500 transition-all duration-300"
                  style={{ width: `${Math.min(newPercentage, 100)}%` }}
                />
              </div>
            </div>
            {newPercentage >= 100 && (
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300 text-center font-medium">
                  This contribution will complete your goal!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          {...register('date', { valueAsDate: true })}
          defaultValue={format(new Date(), 'yyyy-MM-dd')}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Account Selection */}
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
          {accounts?.map((account: any) => (
            <option key={account.id} value={account.id}>
              {account.name} - {formatCurrency(account.balance)}
            </option>
          ))}
        </select>
        {errors.accountId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.accountId.message}
          </p>
        )}
      </div>

      {/* Notes */}
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
          placeholder="Add any notes about this contribution..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.notes.message}
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
          disabled={isSubmitting || isLoading || accountsLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isSubmitting || isLoading ? 'Processing...' : 'Add Contribution'}
        </Button>
      </div>
    </form>
  )
}
