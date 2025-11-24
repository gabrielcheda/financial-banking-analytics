'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransactionSchema, type CreateTransactionInput } from '@/lib/validations/transaction'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { useMerchants } from '@/hooks/useMerchants'
import { toast } from 'sonner'
import { parseLocaleNumber } from '@/lib/numberUtils'
import { useI18n } from '@/i18n'

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
  const { t } = useI18n()
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
    reset,
    trigger,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'expense',
      status: 'completed',
      date: new Date(),
       merchantId: '',
       toAccountId: '',
      ...defaultValues,
      tags: defaultValues?.tags || [],
    },
  })

  // Debug errors in development
  if (process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0) {
    console.log('Form errors:', errors)
  }

  const transactionType = watch('type')
  const selectedAccountId = watch('accountId')
  const selectedCategoryId = watch('categoryId')
  const selectedMerchantId = watch('merchantId')
  const selectedDestinationAccountId = watch('toAccountId')

  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories()
  const { data: accountsData = [], isLoading: accountsLoading } = useActiveAccounts()
  const { data: merchantsData = [], isLoading: merchantsLoading } = useMerchants()

  // Filter categories based on transaction type
  const filteredCategories = useMemo(() => {
    if (transactionType === 'income') {
      return categoriesData.filter((cat) => cat.type === 'income')
    } else if (transactionType === 'expense') {
      return categoriesData.filter((cat) => cat.type === 'expense')
    }
    return categoriesData
  }, [categoriesData, transactionType])

  const filteredMerchants = useMemo(() => {
    if (!selectedCategoryId) {
      return merchantsData
    }
    return merchantsData.filter((merchant) => merchant.categoryId === selectedCategoryId)
  }, [merchantsData, selectedCategoryId])

  const destinationAccounts = useMemo(
    () => accountsData.filter((account) => account.id !== selectedAccountId),
    [accountsData, selectedAccountId]
  )

  useEffect(() => {
    if (defaultValues) {
      reset({
        type: defaultValues.type || 'expense',
        status: defaultValues.status || 'completed',
        date: defaultValues.date || new Date(),
        accountId: defaultValues.accountId || '',
        toAccountId: defaultValues.toAccountId || '',
        categoryId: defaultValues.categoryId || '',
        description: defaultValues.description || '',
        amount: defaultValues.amount || 0,
        merchantId: defaultValues.merchantId || '',
        notes: defaultValues.notes || '',
        tags: defaultValues.tags || [],
      })
      setTags(defaultValues.tags || [])
      void trigger()
    }
  }, [defaultValues, reset, trigger])

  useEffect(() => {
    if (
      selectedMerchantId &&
      !filteredMerchants.some((merchant) => merchant.id === selectedMerchantId)
    ) {
      setValue('merchantId', '')
    }
  }, [filteredMerchants, selectedMerchantId, setValue])

  useEffect(() => {
    if (transactionType !== 'transfer') {
      setValue('toAccountId', '')
    } else if (
      selectedDestinationAccountId &&
      selectedAccountId &&
      selectedDestinationAccountId === selectedAccountId
    ) {
      setValue('toAccountId', '')
    }
  }, [selectedAccountId, selectedDestinationAccountId, transactionType, setValue])

  const handleFormSubmit = useCallback(async (data: CreateTransactionInput) => {
    try {
      // Keep tags synchronized
      const submitData = {
        ...data,
        tags: tags.length > 0 ? tags : undefined,
      }

      await onSubmit(submitData)
      toast.success(isEditing ? t('transactions.updateSuccess') : t('transactions.createSuccess'))
    } catch (error) {
      console.error('Transaction form error:', error)
      // Error toast is handled by the parent component via error-utils
    }
  }, [onSubmit, tags, isEditing])

  const isFormLoading = isLoading || isSubmitting

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
          {t('forms.transaction.type')} <span className="text-red-500">*</span>
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
                {t('forms.transaction.income')}
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('transactions.moneyIn')}</span>
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
                {t('forms.transaction.expense')}
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('transactions.moneyOut')}</span>
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
                {t('forms.transaction.transfer')}
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('transactions.betweenAccounts')}</span>
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
          {t('forms.transaction.description')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="description"
          {...register('description')}
          placeholder={t('forms.transaction.descriptionPlaceholder')}
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
            {t('forms.transaction.amount')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="text"
              id="amount"
              inputMode="decimal"
              {...register('amount', {
                setValueAs: parseLocaleNumber,
              })}
              placeholder="0,00"
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
            {t('forms.transaction.date')} <span className="text-red-500">*</span>
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
            {t('forms.transaction.fromAccount')} <span className="text-red-500">*</span>
          </label>
          <select
            id="accountId"
            {...register('accountId')}
            disabled={accountsLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{t('forms.transaction.selectAccount')}</option>
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
            {t('forms.transaction.category')} <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={categoriesLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{t('forms.transaction.selectCategory')}</option>
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

      {transactionType === 'transfer' && (
        <div>
          <label
            htmlFor="toAccountId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.transaction.toAccount')} <span className="text-red-500">*</span>
          </label>
          <select
            id="toAccountId"
            {...register('toAccountId')}
            disabled={accountsLoading || destinationAccounts.length === 0}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{t('forms.transaction.selectDestinationAccount')}</option>
            {destinationAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
          {destinationAccounts.length === 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('forms.transaction.needTwoAccounts')}
            </p>
          )}
          {errors.toAccountId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.toAccountId.message}
            </p>
          )}
        </div>
      )}

      {/* Status & Merchant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('forms.transaction.status')}
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="completed">{t('forms.transaction.completed')}</option>
            <option value="pending">{t('forms.transaction.pending')}</option>
            <option value="cancelled">{t('forms.transaction.cancelled')}</option>
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
            {t('forms.transaction.merchant')}
          </label>
          <select
            id="merchantId"
            {...register('merchantId')}
            disabled={merchantsLoading || filteredMerchants.length === 0}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('forms.transaction.noMerchant')}</option>
            {filteredMerchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.icon && `${merchant.icon} `}{merchant.name}
              </option>
            ))}
          </select>
          {selectedCategoryId && filteredMerchants.length === 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('forms.transaction.noMerchantsLinked')}
            </p>
          )}
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
          {t('forms.transaction.notes')}
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          placeholder={t('forms.transaction.notesPlaceholder')}
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
          {t('forms.transaction.tags')}
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder={t('forms.transaction.tagsPlaceholder')}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" variant="outline" onClick={handleAddTag} size="sm">
              {t('forms.transaction.addTag')}
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
          {t('forms.transaction.advancedOptions')}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Location removed - now managed through Merchants */}

          {/* Metadata */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('transactions.metadata')}</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="source"
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  {t('common.source')}
                </label>
                <input
                  type="text"
                  id="source"
                  {...register('metadata.source')}
                  placeholder={t('transactions.metadataSourcePlaceholder')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="ipAddress"
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  {t('transactions.ipAddress')}
                </label>
                <input
                  type="text"
                  id="ipAddress"
                  {...register('metadata.ipAddress')}
                  placeholder={t('transactions.metadataIpPlaceholder')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="userAgent"
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  {t('transactions.userAgent')}
                </label>
                <input
                  type="text"
                  id="userAgent"
                  {...register('metadata.userAgent')}
                  placeholder={t('transactions.metadataUserAgentPlaceholder')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Attachments Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{t('transactions.metadataNote')}</strong> {t('transactions.metadataNoteText')}
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
            disabled={isFormLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t('forms.transaction.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isFormLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isFormLoading
            ? t('forms.transaction.saving')
            : isEditing
            ? t('forms.transaction.update')
            : t('forms.transaction.create')}
        </Button>
      </div>
    </form>
  )
}
