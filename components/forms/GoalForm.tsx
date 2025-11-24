'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGoalSchema, updateGoalSchema, type CreateGoalInput, type UpdateGoalInput } from '@/lib/validations/goal'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { format } from 'date-fns'
import type { AccountDTO } from '@/types/dto'
import { parseLocaleNumber } from '@/lib/numberUtils'
import { useI18n } from '@/i18n'

interface GoalFormProps {
  onSubmit: (data: CreateGoalInput | UpdateGoalInput) => Promise<void> | void
  onCancel?: () => void
  defaultValues?: Partial<CreateGoalInput>
  isLoading?: boolean
  isEditing?: boolean
}

export function GoalForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  isEditing = false,
}: GoalFormProps) {
  const { t } = useI18n()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(isEditing ? updateGoalSchema : createGoalSchema),
    defaultValues: {
      priority: 'medium',
      currentAmount: 0,
      ...defaultValues,
    },
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    isActive: true,
  })

  const { data: accountsData, isLoading: accountsLoading } = useActiveAccounts()

  const categories = categoriesData || []
  const accounts = accountsData || []

  const isFormLoading = isLoading || isSubmitting

  const targetAmount = watch('targetAmount')
  const currentAmount = watch('currentAmount')
  const monthlyContribution = watch('monthlyContribution')
  const deadline = watch('deadline')

  const handleFormSubmit = async (data: CreateGoalInput) => {
    await onSubmit(data)
  }

  // Calculate projected completion date
  const calculateProjectedCompletion = () => {
    if (!targetAmount || !currentAmount || !monthlyContribution || monthlyContribution <= 0) {
      return null
    }

    const remaining = targetAmount - (currentAmount || 0)
    if (remaining <= 0) return t('forms.goal.alreadyCompleted')

    const monthsNeeded = Math.ceil(remaining / monthlyContribution)
    const projectedDate = new Date()
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded)

    return format(projectedDate, 'MMM dd, yyyy')
  }

  const projectedCompletion = calculateProjectedCompletion()

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Goal Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('forms.goal.goalName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          placeholder={t('forms.goal.goalNamePlaceholder')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('forms.goal.description')}
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder={t('forms.goal.descriptionPlaceholder')}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Target Amount & Current Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="targetAmount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.goal.targetAmount')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
          <input
            type="text"
            id="targetAmount"
            inputMode="decimal"
            {...register('targetAmount', { setValueAs: parseLocaleNumber })}
            placeholder="0,00"
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>
          {errors.targetAmount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.targetAmount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="currentAmount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.goal.currentAmount')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
          <input
            type="text"
            id="currentAmount"
            inputMode="decimal"
            {...register('currentAmount', { setValueAs: parseLocaleNumber })}
            placeholder="0,00"
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>
          {errors.currentAmount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.currentAmount.message}
            </p>
          )}
        </div>
      </div>

      {/* Deadline & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.goal.deadline')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="deadline"
            {...register('deadline', { valueAsDate: true })}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.deadline.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.goal.priority')} <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">{t('forms.goal.low')}</option>
            <option value="medium">{t('forms.goal.medium')}</option>
            <option value="high">{t('forms.goal.high')}</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.priority.message}
            </p>
          )}
        </div>
      </div>

      {/* Category & Linked Account */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.goal.category')} <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={categoriesLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{t('forms.goal.selectCategory')}</option>
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
            htmlFor="linkedAccountId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.goal.linkedAccountOptional')}
          </label>
          <select
            id="linkedAccountId"
            {...register('linkedAccountId')}
            disabled={accountsLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{t('forms.goal.selectAccount')}</option>
            {accounts.map((account: AccountDTO) => (
              <option key={account.id} value={account.id}>
                {account.name} - {account.type}
              </option>
            ))}
          </select>
          {errors.linkedAccountId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.linkedAccountId.message}
            </p>
          )}
        </div>
      </div>

      {/* Monthly Contribution */}
      <div>
        <label
          htmlFor="monthlyContribution"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('forms.goal.monthlyContribution')}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            $
          </span>
            <input
              type="text"
              id="monthlyContribution"
              inputMode="decimal"
              {...register('monthlyContribution', { setValueAs: parseLocaleNumber })}
              placeholder="0,00"
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        {projectedCompletion && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('forms.goal.projectedCompletion')}: <span className="font-medium">{projectedCompletion}</span>
          </p>
        )}
        {errors.monthlyContribution && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.monthlyContribution.message}
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
            disabled={isFormLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t('forms.goal.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isFormLoading || categoriesLoading || accountsLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isFormLoading ? t('forms.goal.creating') : isEditing ? t('forms.goal.update') : t('forms.goal.create')}
        </Button>
      </div>
    </form>
  )
}
