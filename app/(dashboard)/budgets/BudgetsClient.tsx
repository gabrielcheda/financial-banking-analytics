'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BudgetProgressBar } from '@/components/BudgetProgressBar'
import { BudgetForm } from '@/components/forms/BudgetForm'
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  AlertTriangle,
  TrendingUp,
  Filter,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  useBudgets,
  useCurrentMonthBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from '@/hooks/useBudgets'
import type { BudgetDTO, CreateBudgetDTO, UpdateBudgetDTO } from '@/types/dto'

type PeriodFilter = 'all' | 'monthly' | 'yearly'

export default function BudgetsClient() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetDTO | null>(null)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')

  // Hooks
  const { data: currentMonthData } = useCurrentMonthBudgets()
  const { data: budgetsData, isLoading } = useBudgets({
    period: periodFilter !== 'all' ? periodFilter : undefined,
  })
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  // Get data from API response
  const budgets = budgetsData || []
  const currentMonthBudgets = currentMonthData || []

  // Calculate statistics from current month budgets which includes spent/remaining
  const stats = useMemo(() => {
    const totalBudgeted = currentMonthBudgets.reduce((sum: number, b: any) => sum + (b.limit || b.limitAmount || 0), 0)
    const totalSpent = currentMonthBudgets.reduce((sum: number, b: any) => sum + (b.spent || 0), 0)
    const totalRemaining = currentMonthBudgets.reduce((sum: number, b: any) => sum + (b.remaining || 0), 0)
    const criticalBudgets = currentMonthBudgets.filter((b: any) => (b.percentage || 0) >= 90).length

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      criticalBudgets,
    }
  }, [currentMonthBudgets])

  // Filter budgets
  const filteredBudgets = useMemo(() => {
    if (periodFilter === 'all') return budgets
    return budgets.filter((budget: BudgetDTO) => budget.period === periodFilter)
  }, [budgets, periodFilter])

  // Handlers
  const handleCreateBudget = async (data: any) => {
    // Calculate endDate based on period
    const startDate = new Date(data.startDate)
    const endDate = new Date(startDate)
    if (data.period === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const dto: CreateBudgetDTO = {
      categoryId: data.categoryId,
      limitAmount: data.limit,
      period: data.period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      alerts: data.alerts,
    }
    await createBudget.mutateAsync(dto)
    setShowAddModal(false)
  }

  const handleUpdateBudget = async (data: any) => {
    if (!editingBudget) return
    const dto: UpdateBudgetDTO = {
      limitAmount: data.limit,
      alerts: data.alerts,
    }
    await updateBudget.mutateAsync({ id: editingBudget.id, data: dto })
    setEditingBudget(null)
  }

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      await deleteBudget.mutateAsync(id)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Budgets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your budgets and spending limits
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={createBudget.isPending}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Budgeted
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.totalBudgeted)}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Spent
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remaining
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                      {formatCurrency(stats.totalRemaining)}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Critical Budgets
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                      {stats.criticalBudgets}
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by period:
            </span>
            <div className="flex gap-2">
              {(['all', 'monthly', 'yearly'] as const).map((period) => (
                <Button
                  key={period}
                  variant={periodFilter === period ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodFilter(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Target}
              title="No Budgets Found"
              description={
                periodFilter !== 'all'
                  ? `No ${periodFilter} budgets found. Try adjusting your filter or create a new budget.`
                  : "You haven't created any budgets yet. Set up your first budget to start tracking your spending!"
              }
              action={{
                label: 'Create Budget',
                onClick: () => setShowAddModal(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget: any) => {
            // Calculate budget status from data (backend returns these fields in getCurrentPeriodBudgets)
            const spent = budget.spent || 0
            const limit = budget.limit || budget.limitAmount || 0
            const percentage = budget.percentage || (limit > 0 ? (spent / limit) * 100 : 0)
            const isOverBudget = percentage > 100
            const isNearLimit = percentage >= 80 && percentage <= 100
            const isCritical = percentage >= 90

            return (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: isCritical
                          ? '#dc2626'
                          : isNearLimit
                          ? '#eab308'
                          : '#16a34a',
                      }}
                    />
                    <CardTitle className="text-lg">{budget.categoryId}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBudget(budget)}
                      disabled={updateBudget.isPending}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                      disabled={deleteBudget.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Budget Info */}
                  <div className="space-y-4">
                    {/* Period Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                        {budget.period}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <BudgetProgressBar spent={spent} limit={limit} />

                    {/* Date Range */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Start:</span>
                        <span>{format(new Date(budget.startDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>End:</span>
                        <span>{format(new Date(budget.endDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    {/* Alert Settings */}
                    {budget.alerts.enabled && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                        Alert at {budget.alerts.threshold}% usage
                      </div>
                    )}

                    {/* Warning Message */}
                    {isOverBudget && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <p className="text-xs text-red-800 dark:text-red-300">
                            Budget exceeded by ${(spent - limit).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                    {!isOverBudget && isNearLimit && budget.alerts?.enabled && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            Approaching budget limit ({percentage.toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Budget
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                disabled={createBudget.isPending}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <BudgetForm
                onSubmit={handleCreateBudget}
                onCancel={() => setShowAddModal(false)}
                isLoading={createBudget.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Budget: {editingBudget.categoryId}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingBudget(null)}
                disabled={updateBudget.isPending}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <BudgetForm
                onSubmit={handleUpdateBudget}
                onCancel={() => setEditingBudget(null)}
                defaultValues={{
                  limit: editingBudget.limitAmount,
                  alerts: editingBudget.alerts,
                }}
                isLoading={updateBudget.isPending}
                isEditing
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
