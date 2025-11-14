'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { format } from 'date-fns'
import { VirtualTransactionList } from '@/components/VirtualTransactionList'
import { TransactionCard } from '@/components/TransactionCard'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { useTransactions, useExportTransactions, useImportTransactions, useCreateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import type { TransactionFiltersDTO, CreateTransactionDTO } from '@/types/dto'
import type { CreateTransactionInput } from '@/lib/validations/transaction'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { usePrefetch } from '@/hooks/usePrefetch'

const ITEMS_PER_PAGE = 20

export default function TransactionsClient() {
  const { prefetchTransactionDetail } = usePrefetch()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)

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
    type: selectedType !== 'all' ? (selectedType as 'income' | 'expense') : undefined,
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

  // Get data from API response
  const transactions = transactionsData?.data || []
  const pagination = transactionsData?.meta
  const categories = categoriesData || []

  // Calculate stats from current page data
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
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
    await exportMutation.mutateAsync({
      dateFrom: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
      dateTo: format(new Date(), 'yyyy-MM-dd'),
      categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await importMutation.mutateAsync(file)
      }
    }
    input.click()
  }

  const handleCreateTransaction = async (data: CreateTransactionInput) => {
    const payload = {
      ...data,
      date: data.date instanceof Date ? data.date.toISOString() : data.date,
    } as CreateTransactionDTO
    await createTransaction.mutateAsync(payload)
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Transactions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View and manage all your transactions
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
                    Total Transactions
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
                    Total Income
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Expenses
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  placeholder="Search transactions..."
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
                <option value="all">All Categories</option>
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
                  setSelectedType(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowFiltersModal(true)}>
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exportMutation.isPending || isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              disabled={importMutation.isPending || isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importMutation.isPending ? 'Importing...' : 'Import CSV'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
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
                title="Error Loading Transactions"
                description="Failed to load transactions. Please try again."
              />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Receipt}
                title="No Transactions Found"
                description={searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? "No transactions match your filters. Try adjusting your search."
                  : "You haven't added any transactions yet. Create your first transaction to get started!"}
              />
            </div>
          ) : useVirtualScrolling ? (
            // Virtual scrolling for large lists
            <VirtualTransactionList
              transactions={transactions.map(t => {
                const category = categories.find(c => c.id === t.categoryId)
                return {
                  ...t,
                  date: new Date(t.date),
                  category: category?.name || 'Uncategorized',
                  merchant: t.merchant || '',
                  type: t.type as 'income' | 'expense',
                  status: t.status as 'completed' | 'pending'
                }
              })}
              onTransactionClick={(transaction) => {
                // Transaction details can be viewed by clicking the transaction
                console.log('Transaction clicked:', transaction)
              }}
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
                        ...transaction,
                        date: new Date(transaction.date),
                        category: category?.name || 'Uncategorized',
                        merchant: transaction.merchant || '',
                        type: transaction.type as 'income' | 'expense',
                        status: transaction.status as 'completed' | 'pending'
                      }}
                      onClick={() => {
                        // Transaction details can be viewed by clicking the transaction
                        console.log('Transaction clicked:', transaction)
                      }}
                    />
                  </div>
                )})}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => toggleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Merchant
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => toggleSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Amount
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
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
                          onClick={() => {
                            // Transaction details can be viewed by clicking the transaction
                            console.log('Transaction clicked:', transaction)
                          }}
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
                            {transaction.merchant || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                            <span
                              className={
                                transaction.type === 'income'
                                  ? 'text-green-600'
                                  : 'text-gray-900 dark:text-white'
                              }
                            >
                              {transaction.type === 'income' ? '+' : '-'}$
                              {Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                transaction.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {transaction.status}
                            </span>
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
                  Showing {startIndex + 1} to {endIndex} of{' '}
                  {totalTransactions} transactions
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
        title="Add New Transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setShowAddModal(false)}
          isLoading={createTransaction.isPending}
        />
      </Modal>

      {/* More Filters Modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Advanced Filters"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
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
                To Date
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
                Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="0.00"
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
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
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
                placeholder="Search by merchant..."
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
