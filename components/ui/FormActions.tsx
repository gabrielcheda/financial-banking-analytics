'use client'

import { memo } from 'react'
import { Button } from './Button'

interface FormActionsProps {
  onCancel?: () => void
  onSubmit?: () => void
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  isDisabled?: boolean
  submitVariant?: 'primary' | 'danger' | 'outline' | 'secondary' | 'ghost'
  alignment?: 'left' | 'center' | 'right' | 'between'
  fullWidth?: boolean
}

export const FormActions = memo(function FormActions({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading = false,
  isDisabled = false,
  submitVariant = 'primary',
  alignment = 'right',
  fullWidth = false,
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div className={`flex gap-3 ${alignmentClasses[alignment]} ${fullWidth ? 'flex-col sm:flex-row' : ''}`}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className={fullWidth ? 'w-full sm:w-auto' : ''}
        >
          {cancelLabel}
        </Button>
      )}
      
      {onSubmit && (
        <Button
          type="submit"
          variant={submitVariant}
          onClick={onSubmit}
          disabled={isDisabled || isLoading}
          className={fullWidth ? 'w-full sm:w-auto' : ''}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      )}
    </div>
  )
})
