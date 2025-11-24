'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBudgetSchema, updateBudgetSchema, type CreateBudgetInput, type UpdateBudgetInput } from '@/lib/validations/budget'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { format } from 'date-fns'
import { parseLocaleInteger, parseLocaleNumber } from '@/lib/numberUtils'
import { useI18n } from '@/i18n'

interface BudgetFormProps {
  onSubmit: (data: CreateBudgetInput | UpdateBudgetInput) => Promise<void> | void
  onCancel?: () => void
  defaultValues?: Partial<CreateBudgetInput>
  isLoading?: boolean
  isEditing?: boolean
}

export function BudgetForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  isEditing = false,
}: BudgetFormProps) {
  const { t } = useI18n()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateBudgetInput>({
    resolver: zodResolver(isEditing ? updateBudgetSchema : createBudgetSchema),
    defaultValues: {
      period: 'monthly',
      startDate: new Date(),
      alerts: {
        enabled: true,
        threshold: 80,
      },
      ...defaultValues,
    },
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    type: 'expense',
    isActive: true,
  })

  const categories = categoriesData || []
  const alertsEnabled = watch('alerts.enabled')

  const isFormLoading = isLoading || isSubmitting

  const handleFormSubmit = async (data: CreateBudgetInput) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Category Selection */}
      {!isEditing && (
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.budget.category')} <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={categoriesLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{t('forms.budget.selectCategory')}</option>
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
      )}

      {/* Budget Limit & Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="limit"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.budget.budgetLimit')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="text"
              id="limit"
              inputMode="decimal"
              {...register('limit', { setValueAs: parseLocaleNumber })}
              placeholder={t('forms.budget.limitPlaceholder')}
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.limit && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.limit.message}
            </p>
          )}
        </div>

        {!isEditing && (
          <div>
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('forms.budget.period')} <span className="text-red-500">*</span>
            </label>
            <select
              id="period"
              {...register('period')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">{t('forms.budget.monthly')}</option>
              <option value="yearly">{t('forms.budget.yearly')}</option>
            </select>
            {errors.period && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.period.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Start Date */}
      {!isEditing && (
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.budget.startDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            {...register('startDate', { valueAsDate: true })}
            defaultValue={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.startDate.message}
            </p>
          )}
        </div>
      )}

      {/* Alerts Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('forms.budget.budgetAlerts')}
        </h3>

        {/* Enable Alerts Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <label htmlFor="alerts.enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.budget.enableAlerts')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('forms.budget.enableAlertsDescription')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="alerts.enabled"
              {...register('alerts.enabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Alert Threshold */}
        {alertsEnabled && (
          <div>
            <label
              htmlFor="alerts.threshold"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('forms.budget.alertThreshold')}
            </label>
            <input
              type="text"
              id="alerts.threshold"
              inputMode="numeric"
              {...register('alerts.threshold', { setValueAs: parseLocaleInteger })}
              placeholder={t('forms.budget.thresholdPlaceholder')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('forms.budget.thresholdDescription')}
            </p>
            {errors.alerts?.threshold && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.alerts.threshold.message}
              </p>
            )}
          </div>
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
            {t('forms.budget.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isFormLoading || categoriesLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isFormLoading ? t('forms.budget.saving') : isEditing ? t('forms.budget.update') : t('forms.budget.create')}
        </Button>
      </div>
    </form>
  )
}
