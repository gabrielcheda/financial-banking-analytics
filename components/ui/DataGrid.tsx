'use client'

import { useI18n } from '@/i18n'
import { memo, useMemo } from 'react'
import { format } from 'date-fns'
import { ArrowUpDown } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface DataGridProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  emptyMessage?: string
  isLoading?: boolean
  keyExtractor: (item: T) => string
}

export const DataGrid = memo(function DataGrid<T>({
  data,
  columns,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  emptyMessage,
  isLoading = false,
  keyExtractor,
}: DataGridProps<T>) {
  const { t } = useI18n()
  const defaultEmptyMessage = emptyMessage || t('common.noResults')
  
  const handleSort = (columnKey: string) => {
    if (!onSort) return
    
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(columnKey, newDirection)
  }

  const handleKeyDown = (event: React.KeyboardEvent, item: T, rowIndex: number) => {
    const currentRow = event.currentTarget as HTMLElement
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onRowClick?.(item)
        break
        
      case 'ArrowDown':
        event.preventDefault()
        const nextRow = currentRow.nextElementSibling as HTMLElement
        nextRow?.focus()
        break
        
      case 'ArrowUp':
        event.preventDefault()
        const prevRow = currentRow.previousElementSibling as HTMLElement
        prevRow?.focus()
        break
        
      case 'Home':
        event.preventDefault()
        const firstRow = currentRow.parentElement?.firstElementChild as HTMLElement
        firstRow?.focus()
        break
        
      case 'End':
        event.preventDefault()
        const lastRow = currentRow.parentElement?.lastElementChild as HTMLElement
        lastRow?.focus()
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {defaultEmptyMessage}
      </div>
    )
  }

  return (
    <div
      role="grid"
      aria-label={t('common.dataTable')}
      className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div
        role="row"
        className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 grid"
        style={{
          gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
        }}
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.key}
            role="columnheader"
            aria-sort={
              sortColumn === column.key
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
            className={`px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 ${
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left'
            }`}
          >
            {column.sortable && onSort ? (
              <button
                onClick={() => handleSort(column.key)}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -mx-2 -my-1"
              >
                {column.header}
                <ArrowUpDown className={`w-4 h-4 ${
                  sortColumn === column.key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`} />
              </button>
            ) : (
              column.header
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div role="rowgroup">
        {data.map((item, rowIndex) => (
          <div
            key={keyExtractor(item)}
            role="row"
            tabIndex={0}
            onClick={() => onRowClick?.(item)}
            onKeyDown={(e) => handleKeyDown(e, item, rowIndex)}
            className={`grid border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
              onRowClick
                ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
                : ''
            } transition-colors`}
            style={{
              gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
            }}
            aria-rowindex={rowIndex + 2} // +2 because header is row 1
          >
            {columns.map((column, colIndex) => (
              <div
                key={`${keyExtractor(item)}-${column.key}`}
                role="gridcell"
                aria-colindex={colIndex + 1}
                className={`px-4 py-3 text-sm text-gray-900 dark:text-white ${
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                }`}
              >
                {column.render(item)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}) as <T>(props: DataGridProps<T>) => JSX.Element
