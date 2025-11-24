'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAccountSchema, type CreateAccountInput } from '@/lib/validations/account'
import { Button } from '@/components/ui/Button'
import { parseLocaleNumber } from '@/lib/numberUtils'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

interface AccountFormProps {
  onSubmit: (data: CreateAccountInput) => Promise<void> | void
  onCancel?: () => void
  defaultValues?: Partial<CreateAccountInput>
  isLoading?: boolean
}

const CURRENCIES = [
  { value: 'BRL', label: 'currencies.brl' },
  { value: 'USD', label: 'currencies.usd' },
  { value: 'EUR', label: 'currencies.eur' },
  { value: 'GBP', label: 'currencies.gbp' },
  { value: 'JPY', label: 'currencies.jpy' },
  { value: 'CAD', label: 'currencies.cad' },
  { value: 'AUD', label: 'currencies.aud' },
  { value: 'CHF', label: 'currencies.chf' },
]

export function AccountForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}: AccountFormProps) {
  const { t } = useI18n()
  
  const ACCOUNT_TYPES = [
    { value: 'checking', label: t('forms.account.checkingAccount') },
    { value: 'savings', label: t('forms.account.savingsAccount') },
    { value: 'credit', label: t('forms.account.creditCard') },
    { value: 'investment', label: t('forms.account.investmentAccount') },
  ]
  
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

  const handleFormSubmit = useCallback(async (data: CreateAccountInput) => {
    try {
      await onSubmit(data)
      toast.success(t('accounts.accountSaved'))
      reset()
    } catch (error) {
      console.error('Account form error:', error)
      // Error is handled by the mutation
    }
  }, [onSubmit, reset, t])

  const isFormLoading = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Account Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('forms.account.accountName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          placeholder={t('forms.account.accountNamePlaceholder')}
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
            {t('forms.account.accountType')} <span className="text-red-500">*</span>
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
            {t('forms.account.currency')} <span className="text-red-500">*</span>
          </label>
          <select
            id="currency"
            {...register('currency')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {t(currency.value)}
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
          {t('forms.account.initialBalance')}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            $
          </span>
          <input
            type="text"
            id="balance"
            inputMode="decimal"
            {...register('balance', { setValueAs: parseLocaleNumber })}
            placeholder="0,00"
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.balance && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.balance.message}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('accounts.currentBalanceHint')}
        </p>
      </div>

      {/* Institution (Optional) */}
      <div>
        <label
          htmlFor="institution"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('forms.account.institution')}
        </label>
        <input
          type="text"
          id="institution"
          {...register('institution')}
          placeholder={t('forms.account.institutionPlaceholder')}
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
            disabled={isFormLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t('forms.account.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isFormLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isFormLoading ? t('forms.account.creating') : t('accounts.saveAccount')}
        </Button>
      </div>
    </form>
  )
}
