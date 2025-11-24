'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import {
  Search,
  SlidersHorizontal as Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus,
  Receipt,
  Edit,
} from 'lucide-react'
import { format } from 'date-fns'
import { TransactionCard } from '@/components/TransactionCard'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { useTransactions, useExportTransactions, useImportTransactions, useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import type { TransactionFiltersDTO, CreateTransactionDTO, TransactionDTO, UpdateTransactionDTO } from '@/types/dto'
import type { CreateTransactionInput } from '@/lib/validations/transaction'
import { Modal } from '@/components/ui/Modal'
import { usePrefetch } from '@/hooks/usePrefetch'
import { useI18n } from '@/i18n'
import { BalanceDisplay } from '@/components/BalanceDisplay'

const CSV_TOOLTIP_TEXT =
  'Required columns: date, description, amount, type, category name, account name, status'

type TransactionTypeFilter = 'all' | 'income' | 'expense' | 'transfer'

const buildTransactionPayload = (data: CreateTransactionInput): CreateTransactionDTO => {
  const normalizedDate = data.date instanceof Date ? data.date : new Date(data.date)

  const payload: CreateTransactionDTO = {
    accountId: data.accountId,
    categoryId: data.categoryId,
    date: normalizedDate.toISOString(),
    description: data.description,
    amount: Math.abs(typeof data.amount === 'number' ? data.amount : Number(data.amount)),
    type: data.type,
  }

  if (data.status) {
    payload.status = data.status
  }
  if (data.merchantId) {
    payload.merchantId = data.merchantId
  }
  if (data.notes) {
    payload.notes = data.notes
  }
  if (data.tags && data.tags.length) {
    payload.tags = data.tags
  }
  if (data.toAccountId) {
    payload.toAccountId = data.toAccountId
  }

  return payload
}

const ITEMS_PER_PAGE = 20

const DynamicVirtualTransactionList = dynamic(
  () => import('@/components/VirtualTransactionList').then((mod) => mod.VirtualTransactionList),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        {[...Array(6)].map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full" />
        ))}
      </div>
    ),
  }
)

const DynamicTransactionForm = dynamic(
  () => import('@/components/forms/TransactionForm').then((mod) => mod.TransactionForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {[...Array(4)].map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
    ),
  }
)

export default function TransactionsClient() {
  const { t } = useI18n()
  const { prefetchTransactionDetail } = usePrefetch()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>('all')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionDTO | null>(null)

  // Advanced filter states
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMerchant, setSelectedMerchant] = useState<string>('')

  // Check if virtual scrolling is enabled
  const useVirtualScrolling = isFeatureEnabled('virtual_scrolling')

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Build filters for API
  const filters: TransactionFiltersDTO = useMemo(() => ({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    type: selectedType !== 'all' ? (selectedType as 'income' | 'expense' | 'transfer') : undefined,
    sortBy: sortField,
    sortOrder: sortDirection === 'desc' ? 'DESC' : 'ASC',
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    merchant: selectedMerchant || undefined,
  }), [currentPage, debouncedSearch, selectedCategory, selectedType, sortField, sortDirection, dateFrom, dateTo, minAmount, maxAmount, selectedStatus, selectedMerchant])

  // Fetch transactions from API
  const { data: transactionsData, isLoading, error } = useTransactions(filters)
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const exportMutation = useExportTransactions()
  const importMutation = useImportTransactions()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()

  // Get data from API response
  const transactions = transactionsData?.data || []
  const pagination = transactionsData?.pagination
  const categories = categoriesData || []

  const getMerchantName = (transaction: TransactionDTO) => {
    if (transaction.merchant && transaction.merchant.trim().length > 0) {
      return transaction.merchant
    }
    return transaction.merchantEntity?.name || ''
  }

  const formatAmountDisplay = (transaction: TransactionDTO) => {
    const value = Math.abs(normalizeAmount(transaction.amount)).toFixed(2)
    if (transaction.type === 'income') return `+$${value}`
    if (transaction.type === 'expense') return `-$${value}`
    return `↔ $${value}`
  }

  const getAmountClassName = (transaction: TransactionDTO) => {
    if (transaction.type === 'income') return 'text-green-600 dark:text-green-400'
    if (transaction.type === 'transfer') return 'text-blue-600 dark:text-blue-400'
    return 'text-gray-900 dark:text-white'
  }

  const getStatusBadgeClass = (status: TransactionDTO['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  const openEditModalById = (transactionId: string) => {
    const target = transactions.find((t) => t.id === transactionId)
    if (target) {
      setEditingTransaction(target)
    }
  }

  const normalizeAmount = (amount: number | string | null | undefined) => {
    if (typeof amount === 'number') return amount
    if (typeof amount === 'string') {
      const parsed = Number(amount)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const virtualTransactions = useMemo(
    () =>
      transactions.map((transaction) => {
        const category = categories.find((c) => c.id === transaction.categoryId)
        return {
          id: transaction.id,
          date: new Date(transaction.date),
          description: transaction.description,
          category: category?.name || 'Uncategorized',
          merchant: getMerchantName(transaction),
          amount: normalizeAmount(transaction.amount),
          type: transaction.type as 'income' | 'expense' | 'transfer',
          status: transaction.status as 'completed' | 'pending' | 'cancelled',
        }
      }),
    [transactions, categories]
  )

  // Calculate stats from current page data
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + normalizeAmount(t.amount), 0)

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + normalizeAmount(t.amount), 0)
  )

  const totalTransactions = pagination?.total || 0
  const totalPages = pagination?.totalPages || 1
  const startIndex = pagination ? (pagination.page - 1) * pagination.limit : 0
  const endIndex = startIndex + (transactions?.length || 0)

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handleExport = async () => {
    const { page: _page, limit: _limit, ...exportFilters } = filters
    await exportMutation.mutateAsync(exportFilters)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,text/csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await importMutation.mutateAsync(file)
      }
    }
    input.click()
  }

  const handleCreateTransaction = async (data: CreateTransactionInput) => {
    const payload = buildTransactionPayload(data)
    await createTransaction.mutateAsync(payload)
    setShowAddModal(false)
  }

  const editingDefaults = useMemo<Partial<CreateTransactionInput> | undefined>(() => {
    if (!editingTransaction) return undefined
    return {
      accountId: editingTransaction.accountId,
      toAccountId: editingTransaction.toAccountId || '',
      categoryId: editingTransaction.categoryId,
      description: editingTransaction.description,
      amount: Math.abs(normalizeAmount(editingTransaction.amount)),
      date: new Date(editingTransaction.date),
      type: editingTransaction.type as CreateTransactionInput['type'],
      status: editingTransaction.status as NonNullable<CreateTransactionInput['status']>,
      merchantId: editingTransaction.merchantId || '',
      notes: editingTransaction.notes || '',
      tags: editingTransaction.tags || [],
    }
  }, [editingTransaction])
  const handleUpdateTransactionSubmit = async (data: CreateTransactionInput) => {
    if (!editingTransaction) return
    const payload = buildTransactionPayload(data) as UpdateTransactionDTO
    try {
      await updateTransaction.mutateAsync({
        id: editingTransaction.id,
        data: payload,
      })
      setEditingTransaction(null)
    } catch (error) {
      // errors handled via hook toast, keep modal open for corrections
      console.error('Failed to update transaction', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('transactions.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('transactions.viewAndManage')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('transactions.totalTransactions')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {totalTransactions}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('transactions.totalIncome')}
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    <BalanceDisplay amount={totalIncome} showSign={false} />
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('transactions.totalExpenses')}
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    <BalanceDisplay amount={totalExpenses} showSign={false} />
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('transactions.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                disabled={categoriesLoading}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="all">{t('transactions.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as TransactionTypeFilter)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('transactions.allTypes')}</option>
                <option value="income">{t('transactions.income')}</option>
                <option value="expense">{t('transactions.expense')}</option>
                <option value="transfer">{t('transactions.transfer')}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowFiltersModal(true)}>
              <Filter className="w-4 h-4 mr-2" />
              {t('transactions.advancedFilters')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exportMutation.isPending || isLoading || !transactions || transactions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportMutation.isPending ? t('common.exporting') : t('common.exportCSV')}
            </Button>
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                disabled={importMutation.isPending || isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {importMutation.isPending ? t('common.importing') : t('common.importCSV')}
              </Button>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-md bg-gray-900 text-[11px] text-white px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                {CSV_TOOLTIP_TEXT}
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('transactions.addTransaction')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List/Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <EmptyState
                icon={Receipt}
                title={t('errors.loadingFailed')}
                description={t('transactions.loadingError')}
              />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Receipt}
                title={t('empty.noTransactions')}
                description={searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? t('transactions.noMatchingFilters')
                  : t('transactions.createFirstTransaction')}
              />
            </div>
          ) : useVirtualScrolling ? (
            // Virtual scrolling for large lists
            <DynamicVirtualTransactionList
              transactions={virtualTransactions}
              onTransactionClick={(transaction) => openEditModalById(transaction.id)}
            />
          ) : (
            // Traditional pagination
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId)
                  return (
                  <div
                    key={transaction.id}
                    className="p-4"
                    onMouseEnter={() => prefetchTransactionDetail(transaction.id)}
                  >
                    <TransactionCard
                      transaction={{
                        id: transaction.id,
                        date: new Date(transaction.date),
                        category: category?.name || t('categories.uncategorized'),
                        description: transaction.description,
                        merchant: getMerchantName(transaction),
                        amount: normalizeAmount(transaction.amount),
                        type: transaction.type as 'income' | 'expense' | 'transfer',
                        status: transaction.status as 'completed' | 'pending' | 'cancelled'
                      }}
                      onClick={() => openEditModalById(transaction.id)}
                    />
                  </div>
                )})}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => toggleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          {t('transactions.date')}
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('transactions.description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('transactions.category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('transactions.merchant')}
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => toggleSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {t('transactions.amount')}
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('transactions.status')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {transactions.map((transaction) => {
                      const category = categories.find(c => c.id === transaction.categoryId)
                      const categoryColor = category?.color || '#6b7280'

                      return (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onMouseEnter={() => prefetchTransactionDetail(transaction.id)}
                          onClick={() => openEditModalById(transaction.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${categoryColor}20`,
                                color: categoryColor,
                              }}
                            >
                              {category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {getMerchantName(transaction) || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                            <span className={getAmountClassName(transaction)}>
                              {formatAmountDisplay(transaction)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                openEditModalById(transaction.id)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {t('common.edit')}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.showing')} {startIndex + 1} {t('common.to')} {endIndex} {t('common.of')}{' '}
                  {totalTransactions} {t('transactions.transactions')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('transactions.newTransaction')}
        size="lg"
      >
        <DynamicTransactionForm
          key="create-transaction-form"
          onSubmit={handleCreateTransaction}
          onCancel={() => setShowAddModal(false)}
          isLoading={createTransaction.isPending}
        />
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        title={t('transactions.editTransaction')}
        size="lg"
      >
        {editingDefaults && (
          <DynamicTransactionForm
            key={editingTransaction?.id || 'edit-transaction-form'}
            onSubmit={handleUpdateTransactionSubmit}
            onCancel={() => setEditingTransaction(null)}
            defaultValues={editingDefaults}
            isLoading={updateTransaction.isPending}
            isEditing
          />
        )}
      </Modal>

      {/* More Filters Modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title={t('transactions.advancedFilters')}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('transactions.fromDate')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('transactions.toDate')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.minAmount')}
              </label>
              <input
                type="number"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder={t('common.amountPlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.maxAmount')}
              </label>
              <input
                type="number"
                step="0.01"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder={t('common.amountPlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('common.allStatuses')}</option>
                <option value="completed">{t('common.completed')}</option>
                <option value="pending">{t('common.pending')}</option>
                <option value="cancelled">{t('common.cancelled')}</option>
              </select>
            </div>

            {/* Merchant Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Merchant
              </label>
              <input
                type="text"
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                placeholder={t('common.searchByMerchant')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setMinAmount('')
                setMaxAmount('')
                setSelectedStatus('all')
                setSelectedMerchant('')
              }}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowFiltersModal(false)
                setCurrentPage(1)
              }}
              className="w-full sm:w-auto"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
