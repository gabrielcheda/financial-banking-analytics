'use client'

import { useI18n } from '@/i18n'
import { useState, useMemo } from 'react'
import { DataGrid } from '@/components/ui/DataGrid'
import { format } from 'date-fns'
import type { TransactionDTO } from '@/types/dto'
import { BalanceDisplay } from './BalanceDisplay'

interface TransactionDataGridProps {
  transactions: TransactionDTO[]
  onTransactionClick?: (transaction: TransactionDTO) => void
  isLoading?: boolean
}

export function TransactionDataGrid({
  transactions,
  onTransactionClick,
  isLoading = false,
}: TransactionDataGridProps) {
  const { t } = useI18n()
  const [sortColumn, setSortColumn] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction)
  }

  const sortedTransactions = useMemo(() => {
    if (!sortColumn) return transactions

    return [...transactions].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortColumn) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'description':
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'category':
          aValue = a.categoryId || ''
          bValue = b.categoryId || ''
          break
        case 'merchant':
          aValue = (a.merchantId || a.merchant || '').toLowerCase()
          bValue = (b.merchantId || b.merchant || '').toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [transactions, sortColumn, sortDirection])

  const columns = [
    {
      key: 'date',
      header: t('transactions.date'),
      sortable: true,
      width: '140px',
      render: (transaction: TransactionDTO) => (
        <span className="text-gray-600 dark:text-gray-400">
          {format(new Date(transaction.date), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: 'description',
      header: t('transactions.description'),
      sortable: true,
      render: (transaction: TransactionDTO) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {transaction.description}
          </div>
          {transaction.merchant && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {transaction.merchant}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: t('transactions.category'),
      sortable: true,
      width: '180px',
      render: (transaction: TransactionDTO) =>
        transaction.categoryId ? (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {transaction.categoryId}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'amount',
      header: t('transactions.amount'),
      sortable: true,
      align: 'right' as const,
      width: '140px',
      render: (transaction: TransactionDTO) => {
        const amountColor =
          transaction.type === 'income'
            ? 'text-green-600 dark:text-green-400'
            : transaction.type === 'expense'
              ? 'text-gray-900 dark:text-white'
              : 'text-blue-600 dark:text-blue-400'

        const prefix =
          transaction.type === 'income'
            ? '+'
            : transaction.type === 'expense'
              ? '-'
              : '↔'

        return (
          <span className={`font-semibold ${amountColor}`}>
            {prefix}<BalanceDisplay amount={transaction.amount} showSign={false} />
          </span>
        )
      },
    },
    {
      key: 'status',
      header: t('transactions.status'),
      width: '120px',
      render: (transaction: TransactionDTO) => {
        const statusClasses =
          transaction.status === 'completed'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : transaction.status === 'cancelled'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'

        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${statusClasses}`}
          >
            {transaction.status}
          </span>
        )
      },
    },
  ]

  return (
    <DataGrid
      data={sortedTransactions}
      columns={columns}
      onRowClick={onTransactionClick}
      onSort={handleSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      keyExtractor={(transaction) => transaction.id}
      isLoading={isLoading}
      emptyMessage={t('dashboard.noTransactionsFound')}
    />
  )
}
