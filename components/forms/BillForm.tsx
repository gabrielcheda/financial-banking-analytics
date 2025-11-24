'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBillSchema, updateBillSchema, type CreateBillInput, type UpdateBillInput } from '@/lib/validations/bill'
import { Button } from '@/components/ui/Button'
import { useMerchants } from '@/hooks/useMerchants'
import { useCategories } from '@/hooks/useCategories'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { parseLocaleInteger, parseLocaleNumber } from '@/lib/numberUtils'
import { useI18n } from '@/i18n'

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
  const { t } = useI18n()
  const [enableReminder, setEnableReminder] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreateBillInput>({
    resolver: zodResolver(isEditing ? updateBillSchema : createBillSchema),
    defaultValues: {
      isRecurring: false,
      reminders: [{ enabled: false, daysBefore: 3 }],
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      merchantId: '',
      categoryId: '',
      accountId: '',
      ...defaultValues,
    },
  })

  const { data: merchantsData, isLoading: merchantsLoading } = useMerchants()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    type: 'expense',
    isActive: true,
  })
  const { data: accountsData, isLoading: accountsLoading } = useActiveAccounts()

  const merchants = merchantsData || []
  const categories = categoriesData || []
  const accounts = accountsData || []
  const isRecurring = watch('isRecurring')
  const selectedCategoryId = watch('categoryId')
  const selectedMerchantId = watch('merchantId')

  const isFormLoading = isLoading || isSubmitting

  const filteredMerchants = useMemo(
    () => merchants.filter((merchant) => merchant.categoryId === selectedCategoryId),
    [merchants, selectedCategoryId]
  )

  useEffect(() => {
    if (
      selectedMerchantId &&
      !filteredMerchants.some((merchant) => merchant.id === selectedMerchantId)
    ) {
      setValue('merchantId', '')
    }
  }, [filteredMerchants, selectedMerchantId, setValue])

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
            {t('forms.bill.billName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            placeholder={t('forms.bill.billNamePlaceholder')}
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
          {t('forms.bill.amount')} <span className="text-red-500">*</span>
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
            placeholder={t('forms.bill.amountPlaceholder')}
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Category, Merchant & Account Selection */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('forms.bill.category')} <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              {...register('categoryId')}
              disabled={categoriesLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">{t('forms.bill.selectCategory')}</option>
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
              htmlFor="merchantId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('forms.bill.merchant')} <span className="text-red-500">*</span>
            </label>
            <select
              id="merchantId"
              {...register('merchantId')}
              disabled={merchantsLoading || !selectedCategoryId}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">
                {selectedCategoryId ? t('forms.bill.selectMerchant') : t('forms.bill.selectCategoryFirst')}
              </option>
              {filteredMerchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
            {errors.merchantId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.merchantId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('forms.bill.paymentAccount')} <span className="text-red-500">*</span>
            </label>
            <select
              id="accountId"
              {...register('accountId')}
              disabled={accountsLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">{t('forms.bill.selectAccount')}</option>
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
            {t('forms.bill.dueDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate')}
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
            {t('forms.bill.recurringBill')}
          </h3>

          {/* Enable Recurring Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('forms.bill.isRecurring')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('forms.bill.isRecurringDescription')}
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
                {t('forms.bill.frequency')} <span className="text-red-500">*</span>
              </label>
              <select
                id="frequency"
                {...register('frequency')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('forms.bill.selectFrequency')}</option>
                <option value="weekly">{t('forms.bill.weekly')}</option>
                <option value="monthly">{t('forms.bill.monthly')}</option>
                <option value="yearly">{t('forms.bill.yearly')}</option>
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
            {t('forms.bill.reminders')}
          </h3>

          {/* Enable Reminder Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <label htmlFor="enableReminder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('forms.bill.enableReminders')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('forms.bill.enableRemindersDescription')}
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
                {t('forms.bill.reminderDays')}
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
                {t('forms.bill.reminderDaysDescription')}
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
            {t('forms.bill.notesOptional')}
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            placeholder={t('forms.bill.notesPlaceholder')}
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
            disabled={isFormLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t('forms.bill.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isFormLoading || merchantsLoading || categoriesLoading || accountsLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isFormLoading ? t('forms.bill.saving') : isEditing ? t('forms.bill.update') : t('forms.bill.create')}
        </Button>
      </div>
    </form>
  )
}
