'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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

interface VirtualTransactionListProps {
  transactions: Transaction[]
  onTransactionClick?: (transaction: Transaction) => void
}

export function VirtualTransactionList({
  transactions,
  onTransactionClick,
}: VirtualTransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65, // Estimated row height in pixels
    overscan: 10, // Number of items to render outside visible area
  })

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{
        contain: 'strict',
      }}
    >
      {/* Table Header - Fixed */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12 gap-4 px-6 py-3">
          <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Date
          </div>
          <div className="col-span-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Description
          </div>
          <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Category
          </div>
          <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Merchant
          </div>
          <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
            Amount
          </div>
          <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Status
          </div>
        </div>
      </div>

      {/* Virtual List Container */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Virtual Items */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const transaction = transactions[virtualRow.index]

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-800"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onTransactionClick?.(transaction)}
            >
              <div className="grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer">
                {/* Date */}
                <div className="col-span-2 flex items-center text-sm text-gray-900 dark:text-white">
                  {format(transaction.date, 'MMM dd, yyyy')}
                </div>

                {/* Description */}
                <div className="col-span-3 flex items-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {transaction.description}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 flex items-center">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full truncate"
                    style={{
                      backgroundColor: `${getCategoryColor(transaction.category)}20`,
                      color: getCategoryColor(transaction.category),
                    }}
                  >
                    {transaction.category}
                  </span>
                </div>

                {/* Merchant */}
                <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400 truncate">
                  {transaction.merchant && transaction.merchant.trim().length > 0 ? transaction.merchant : '—'}
                </div>

                {/* Amount */}
                <div className="col-span-2 flex items-center justify-end text-sm font-semibold">
                  <span
                    className={
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : transaction.type === 'transfer'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                    }
                  >
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '↔ '}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : transaction.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
        </div>
      )}
    </div>
  )
}
