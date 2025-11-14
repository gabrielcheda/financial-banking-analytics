import { LucideIcon } from 'lucide-react'
import { Button } from './ui/Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'search' | 'filter' | 'error'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const variantStyles = {
    default: 'bg-gray-100 dark:bg-gray-800',
    search: 'bg-blue-100 dark:bg-blue-900/30',
    filter: 'bg-purple-100 dark:bg-purple-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
  }

  const iconColors = {
    default: 'text-gray-400 dark:text-gray-600',
    search: 'text-blue-500 dark:text-blue-400',
    filter: 'text-purple-500 dark:text-purple-400',
    error: 'text-red-500 dark:text-red-400',
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className={`rounded-full ${variantStyles[variant]} p-6 mb-4`}>
        <Icon className={`w-12 h-12 ${iconColors[variant]}`} aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  )
}
