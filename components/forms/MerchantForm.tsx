'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { MerchantDTO, CreateMerchantDTO, UpdateMerchantDTO, LocationDTO } from '@/types/dto'
import { useCategories } from '@/hooks/useCategories'
import { useI18n } from '@/i18n'

type MerchantFormInput = CreateMerchantDTO | UpdateMerchantDTO

interface MerchantFormProps {
  merchant?: MerchantDTO
  onSubmit: (data: MerchantFormInput) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
}

const PRESET_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

const COMMON_ICONS = [
  '🏪', // Store
  '🏬', // Department Store
  '🏭', // Factory
  '🏢', // Office Building
  '🍔', // Restaurant/Fast Food
  '☕', // Coffee
  '🍕', // Pizza
  '🛒', // Shopping Cart
  '💊', // Pharmacy
  '⛽', // Gas Station
  '✈️', // Travel
  '🎬', // Entertainment
  '🏋️', // Gym
  '📚', // Bookstore
  '🎮', // Gaming
  '🍺', // Bar
]

export function MerchantForm({ merchant, onSubmit, onCancel, isLoading }: MerchantFormProps) {
  const { t } = useI18n()
  const { data: categories = [] } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<CreateMerchantDTO>({
    name: merchant?.name || '',
    phone: merchant?.phone || '',
    color: merchant?.color || '#3b82f6',
    icon: merchant?.icon || '',
    categoryId: merchant?.categoryId || '',
    location: merchant?.location || {
      address: '',
      city: '',
      state: '',
      country: '',
    },
  })

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [customColor, setCustomColor] = useState(formData.color)

  const isFormLoading = isLoading || isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Remove empty location if all fields are empty
    const cleanedData = { ...formData }
    if (cleanedData.location &&
        !cleanedData.location.address &&
        !cleanedData.location.city &&
        !cleanedData.location.state &&
        !cleanedData.location.country) {
      cleanedData.location = undefined
    }

    try {
      setIsSubmitting(true)
      await onSubmit(cleanedData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateLocation = (field: keyof LocationDTO, value: string) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [field]: value || undefined,
      } as LocationDTO,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('common.basicInformation')}</h3>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('forms.merchant.merchantName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            maxLength={255}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder={t('forms.merchant.merchantNamePlaceholder')}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('forms.merchant.phoneOptional')}
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            maxLength={20}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder={t('forms.merchant.phonePlaceholder')}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('forms.merchant.category')} <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="">{t('forms.merchant.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('common.visual')}</h3>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('forms.merchant.color')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  formData.color === color
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
                title={color}
              >
                {formData.color === color && (
                  <span className="sr-only">{t('accessibility.selected')}</span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={t('forms.merchant.customColor')}
            >
              +
            </button>
          </div>

          {showColorPicker && (
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder={t('forms.merchant.hexColor')}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <Button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, color: customColor })
                  setShowColorPicker(false)
                }}
                size="sm"
              >
                {t('common.apply')}
              </Button>
            </div>
          )}

          {/* Preview */}
          <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('common.preview')}:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon || '🏪'}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{formData.name || 'Merchant Name'}</span>
            </div>
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('forms.merchant.icon')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`w-12 h-12 rounded-lg border-2 text-2xl transition-all ${
                  formData.icon === icon
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {icon}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={t('forms.merchant.customEmoji')}
            >
              +
            </button>
          </div>

          {showIconPicker && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder={t('forms.merchant.emojiPlaceholder')}
                maxLength={50}
              />
              <Button
                type="button"
                onClick={() => setShowIconPicker(false)}
                size="sm"
              >
                {t('common.close')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('forms.merchant.locationOptional')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('forms.merchant.address')}
            </label>
            <input
              type="text"
              id="address"
              value={formData.location?.address || ''}
              onChange={(e) => updateLocation('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder={t('forms.merchant.addressPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('forms.merchant.city')}
            </label>
            <input
              type="text"
              id="city"
              value={formData.location?.city || ''}
              onChange={(e) => updateLocation('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder={t('forms.merchant.cityPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('forms.merchant.state')}
            </label>
            <input
              type="text"
              id="state"
              value={formData.location?.state || ''}
              onChange={(e) => updateLocation('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder={t('forms.merchant.statePlaceholder')}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('forms.merchant.country')}
            </label>
            <input
              type="text"
              id="country"
              value={formData.location?.country || ''}
              onChange={(e) => updateLocation('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder={t('forms.merchant.countryPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormLoading}
            className="flex-1"
          >
            {t('forms.merchant.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isFormLoading}
          className="flex-1"
        >
          {isFormLoading ? t('forms.merchant.creating') : merchant ? t('forms.merchant.update') : t('forms.merchant.create')}
        </Button>
      </div>
    </form>
  )
}
