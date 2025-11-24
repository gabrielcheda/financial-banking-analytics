'use client'

import { useState, useMemo } from 'react'
import { useI18n } from '@/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { useBalanceFormatter } from '@/hooks/useBalanceFormatter'
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
  const { t } = useI18n()
  const { formatBalance } = useBalanceFormatter()
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

  const toNumber = (value: number | string | null | undefined) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  // Get data from API response
  const budgets = budgetsData || []
  const currentMonthBudgets = currentMonthData || []

  // Calculate statistics from current month budgets which includes spent/remaining
  const stats = useMemo(() => {
    const totalBudgeted = currentMonthBudgets.reduce(
      (sum: number, b: any) => sum + toNumber(b.limit ?? b.limitAmount),
      0
    )
    const totalSpent = currentMonthBudgets.reduce(
      (sum: number, b: any) => sum + toNumber(b.spent),
      0
    )
    const totalRemaining = currentMonthBudgets.reduce(
      (sum: number, b: any) => sum + toNumber(b.remaining),
      0
    )
    const criticalBudgets = currentMonthBudgets.filter((b: any) => {
      const limit = toNumber(b.limit ?? b.limitAmount)
      const spent = toNumber(b.spent)
      const percentage = b.percentage ?? (limit > 0 ? (spent / limit) * 100 : 0)
      return percentage >= 90
    }).length

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
    if (confirm(t('budgets.deleteConfirmation'))) {
      await deleteBudget.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('budgets.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('budgets.manageBudgets')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={createBudget.isPending}
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('budgets.addBudget')}
        </Button>
      </div>

      {/* Stats Cards */}
      <section aria-labelledby="budget-summary-heading">
        <h2 id="budget-summary-heading" className="sr-only">
          {t('budgets.budgetSummary')}
        </h2>
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
                      {t('budgets.totalBudgeted')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      $<BalanceDisplay amount={stats.totalBudgeted ?? 0} showSign={false} />
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
                      {t('budgets.totalSpent')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      $<BalanceDisplay amount={stats.totalSpent ?? 0} showSign={false} />
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
                      {t('budgets.remaining')}
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                      $<BalanceDisplay amount={stats.totalRemaining ?? 0} showSign={false} />
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <Target className="w-6 h-6 text-green-700 dark:text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('budgets.criticalBudgets')}
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
      </section>

      {/* Filters */}
      <section aria-labelledby="budget-filter-heading">
        <h2 id="budget-filter-heading" className="sr-only">
          {t('budgets.filterBudgets')}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('budgets.filterByPeriod')}:
              </span>
              <div className="flex gap-2">
                {(['all', 'monthly', 'yearly'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={periodFilter === period ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodFilter(period)}
                  >
                    {t(`budgets.${period}`)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Budgets Grid */}
      <section aria-labelledby="budget-list-heading">
        <h2 id="budget-list-heading" className="sr-only">
          {t('budgets.budgetList')}
        </h2>
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
                title={t('budgets.noBudgetsFound')}
                description={
                  periodFilter !== 'all'
                    ? `No ${periodFilter} budgets found. Try adjusting your filter or create a new budget.`
                    : "You haven't created any budgets yet. Set up your first budget to start tracking your spending!"
                }
                action={{
                  label: t('budgets.createBudget'),
                  onClick: () => setShowAddModal(true),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBudgets.map((budget: any) => {
            // Calculate budget status from data (backend returns these fields in getCurrentPeriodBudgets)
            const spent = toNumber(budget.spent)
            const limit = toNumber(budget.limit ?? budget.limitAmount)
            const percentage = budget.percentage ?? (limit > 0 ? (spent / limit) * 100 : 0)
            const isOverBudget = percentage > 100
            const alertThreshold = budget.alerts?.threshold ?? 80
            const isNearLimit = percentage >= alertThreshold && percentage <= 100
            const isCritical = percentage >= 90
            const categoryName = budget.categoryName ?? budget.category?.name ?? budget.categoryId

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
                    <CardTitle as="h3" className="text-lg">
                      {categoryName}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBudget(budget)}
                      disabled={updateBudget.isPending}
                      aria-label={t('common.edit')}
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">{t('common.edit')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                      disabled={deleteBudget.isPending}
                      aria-label={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" aria-hidden="true" />
                      <span className="sr-only">{t('common.delete')}</span>
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
                        <span>{t('budgets.start')}:</span>
                        <span>{format(new Date(budget.startDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>{t('budgets.end')}:</span>
                        <span>{format(new Date(budget.endDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    {/* Alert Settings */}
                    {budget.alerts?.enabled && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                        {t('budgets.alertAt', { threshold: (budget.alerts.threshold ?? 80) })}
                      </div>
                    )}

                    {/* Warning Message */}
                    {isOverBudget && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <p className="text-xs text-red-800 dark:text-red-300">
                            {t('budgets.budgetExceeded', { amount: formatBalance(spent - limit) })}
                          </p>
                        </div>
                      </div>
                    )}
                    {!isOverBudget && isNearLimit && budget.alerts?.enabled && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            {t('budgets.approachingLimit', { percentage: percentage.toFixed(0), threshold: alertThreshold })}
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
      </section>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('budgets.createNewBudget')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                disabled={createBudget.isPending}
                aria-label={t('budgets.closeCreateModal')}
              >
                <X className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">{t('budgets.closeCreateModal')}</span>
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
                {t('budgets.editBudget')}: {editingBudget.categoryId}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingBudget(null)}
                disabled={updateBudget.isPending}
                aria-label={t('budgets.closeEditModal')}
              >
                <X className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">{t('budgets.closeEditModal')}</span>
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
