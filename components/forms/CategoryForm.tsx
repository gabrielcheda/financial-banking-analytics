'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import type { CreateCategoryDTO, UpdateCategoryDTO } from '@/types/dto'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  icon: z.string().optional(),
})

type CategoryFormInput = z.infer<typeof categorySchema>

interface CategoryFormProps {
  onSubmit: (data: CategoryFormInput) => Promise<void> | void
  onCancel?: () => void
  defaultValues?: Partial<CategoryFormInput>
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
  '🏠', '🚗', '🍔', '🛒', '💊', '⚡', '🎬', '🎮',
  '✈️', '🏋️', '📚', '☕', '🍺', '💰', '💳', '🎁',
]

export function CategoryForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: 'expense',
      color: '#10b981',
      icon: '🏠',
      ...defaultValues,
    },
  })

  const selectedColor = watch('color')
  const selectedIcon = watch('icon')

  const handleFormSubmit = async (data: CategoryFormInput) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Category Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          placeholder="e.g., Groceries, Salary"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Category Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all ${
              watch('type') === 'income'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <input type="radio" {...register('type')} value="income" className="sr-only" />
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Income
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Money received
              </span>
            </div>
          </label>

          <label
            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all ${
              watch('type') === 'expense'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <input type="radio" {...register('type')} value="expense" className="sr-only" />
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Expense
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Money spent
              </span>
            </div>
          </label>
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
        )}
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                selectedColor === color
                  ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="customColor" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Or enter custom hex color:
          </label>
          <input
            type="text"
            id="customColor"
            {...register('color')}
            placeholder="#10b981"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.color.message}
          </p>
        )}
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Icon (Optional)
        </label>
        <div className="grid grid-cols-8 gap-2">
          {COMMON_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue('icon', icon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                selectedIcon === icon
                  ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
              }`}
              aria-label={`Select icon ${icon}`}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="customIcon" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Or enter custom emoji:
          </label>
          <input
            type="text"
            id="customIcon"
            {...register('icon')}
            placeholder="🏠"
            maxLength={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.icon && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.icon.message}
          </p>
        )}
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview
        </label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{
              backgroundColor: selectedColor + '20',
              color: selectedColor,
            }}
          >
            {selectedIcon || '📁'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {watch('name') || 'Category Name'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {watch('type')}
            </p>
          </div>
        </div>
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
          {isSubmitting || isLoading ? 'Saving...' : 'Save Category'}
        </Button>
      </div>
    </form>
  )
}
