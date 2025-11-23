'use client'

import { format } from 'date-fns'
import { getCategoryColor } from '@/lib/mockData'

interface Transaction {
  id: string
  date: Date
  description: string
  category: string
  merchant?: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  status: 'completed' | 'pending' | 'cancelled'
}

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const merchantLabel = transaction.merchant && transaction.merchant.trim().length > 0 ? transaction.merchant : '—'

  const amountPrefix =
    transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '↔'

  const amountColor =
    transaction.type === 'income'
      ? 'text-green-600 dark:text-green-400'
      : transaction.type === 'expense'
        ? 'text-gray-900 dark:text-white'
        : 'text-blue-600 dark:text-blue-400'

  const statusClasses =
    transaction.status === 'completed'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : transaction.status === 'cancelled'
        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header: Description and Amount */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate text-base">
            {transaction.description}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {merchantLabel}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-semibold text-base ${amountColor}`}>
            {amountPrefix}
            {amountPrefix === '↔' ? ' ' : ''}$
            {Math.abs(transaction.amount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Category and Date */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: `${getCategoryColor(transaction.category)}20`,
            color: getCategoryColor(transaction.category),
          }}
        >
          {transaction.category}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(transaction.date, 'MMM dd, yyyy')}
        </span>
      </div>

      {/* Status */}
      <div className="flex justify-end">
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${statusClasses}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  )
}
