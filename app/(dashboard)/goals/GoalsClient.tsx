'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { GoalForm } from '@/components/forms/GoalForm'
import { ContributeForm } from '@/components/forms/ContributeForm'
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  Clock,
  Flag,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useContributeToGoal,
} from '@/hooks/useGoals'
import type { GoalDTO, CreateGoalDTO, UpdateGoalDTO, ContributeToGoalDTO } from '@/types/dto'

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled'
type PriorityFilter = 'all' | 'low' | 'medium' | 'high'
type SortOption = 'deadline' | 'progress' | 'amount'

export default function GoalsClient() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalDTO | null>(null)
  const [contributingGoal, setContributingGoal] = useState<GoalDTO | null>(null)
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('deadline')

  // Hooks
  const { data: goalsData, isLoading } = useGoals({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  })
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const contributeToGoal = useContributeToGoal()

  // Get data from API response
  const goals = goalsData?.data || []

  // Helper functions to calculate missing properties
  const calculatePercentage = (currentAmount: number, targetAmount: number): number => {
    if (targetAmount === 0) return 0
    return (currentAmount / targetAmount) * 100
  }

  const calculateRemainingAmount = (targetAmount: number, currentAmount: number): number => {
    return Math.max(0, targetAmount - currentAmount)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!goals || !Array.isArray(goals)) {
      return {
        activeCount: 0,
        completedCount: 0,
        totalTarget: 0,
        totalSaved: 0,
        totalRemaining: 0,
        overallProgress: 0,
      }
    }

    const activeGoals = goals.filter((g) => g.status === 'active')
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0)
    const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0)
    const totalRemaining = activeGoals.reduce((sum, g) => sum + g.targetAmount - g.currentAmount, 0)
    const completedGoals = goals.filter((g) => g.status === 'completed').length

    return {
      activeCount: activeGoals.length,
      completedCount: completedGoals,
      totalTarget,
      totalSaved,
      totalRemaining,
      overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    }
  }, [goals])

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    if (!goals || !Array.isArray(goals)) return []

    let filtered = [...goals]

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case 'amount':
          return b.targetAmount - a.targetAmount
        default:
          return 0
      }
    })

    return filtered
  }, [goals, sortBy])

  // Handlers
  const handleCreateGoal = async (data: any) => {
    // Convert Date to ISO string for API
    const payload: CreateGoalDTO = {
      ...data,
      deadline: data.deadline instanceof Date ? data.deadline.toISOString() : data.deadline,
    }
    await createGoal.mutateAsync(payload)
    setShowAddModal(false)
  }

  const handleUpdateGoal = async (data: any) => {
    if (!editingGoal) return
    // Convert Date to ISO string for API
    const payload: UpdateGoalDTO = {
      ...data,
      deadline: data.deadline instanceof Date ? data.deadline.toISOString() : data.deadline,
    }
    await updateGoal.mutateAsync({ id: editingGoal.id, data: payload })
    setEditingGoal(null)
  }

  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return
    await deleteGoal.mutateAsync(deletingGoalId)
    setDeletingGoalId(null)
  }

  const handleContributeToGoal = async (data: any) => {
    if (!contributingGoal) return
    // Convert Date to ISO string for API
    const payload: ContributeToGoalDTO = {
      ...data,
      date: data.date instanceof Date ? data.date.toISOString() : data.date,
    }
    await contributeToGoal.mutateAsync({ id: contributingGoal.id, data: payload })
    setContributingGoal(null)
  }

  const handleMarkAsCompleted = async (goal: GoalDTO) => {
    await updateGoal.mutateAsync({
      id: goal.id,
      data: { status: 'completed' },
    })
  }

  const handleMarkAsCancelled = async (goal: GoalDTO) => {
    if (
      confirm(
        'Are you sure you want to mark this goal as cancelled? You can reactivate it later.'
      )
    ) {
      await updateGoal.mutateAsync({
        id: goal.id,
        data: { status: 'cancelled' },
      })
    }
  }

  const handleReactivateGoal = async (goal: GoalDTO) => {
    await updateGoal.mutateAsync({
      id: goal.id,
      data: { status: 'active' },
    })
  }

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = amount ?? 0
    return `$${Math.abs(safeAmount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-3 h-3" />
      case 'completed':
        return <CheckCircle className="w-3 h-3" />
      case 'cancelled':
        return <XCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date())
    return days
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set and track your financial goals
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.activeCount}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.completedCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats.totalSaved)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.overallProgress.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${priorityFilter === priority
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="deadline">Deadline</option>
                <option value="progress">Progress</option>
                <option value="amount">Target Amount</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-2 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          description={
            statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters to see more goals.'
              : 'Create your first financial goal to start tracking your progress.'
          }
          action={{
            label: "Create Goal",
            onClick: () => setShowAddModal(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(filteredAndSortedGoals || []).map((goal) => {
            const daysUntilDeadline = getDaysUntilDeadline(goal.deadline)
            const isOverdue = daysUntilDeadline < 0 && goal.status === 'active'
            const isNearDeadline = daysUntilDeadline <= 7 && daysUntilDeadline >= 0
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount)
            const remainingAmount = calculateRemainingAmount(goal.targetAmount, goal.currentAmount)

            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {goal.name}
                        </h3>
                        {percentage >= 100 && goal.status === 'active' && (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            goal.status
                          )}`}
                        >
                          {getStatusIcon(goal.status)}
                          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            goal.priority
                          )}`}
                        >
                          <Flag className="w-3 h-3" />
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${percentage >= 100
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : percentage >= 75
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : percentage >= 50
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                      {/* Milestone markers */}
                      <div className="absolute inset-0 flex">
                        {[25, 50, 75].map((milestone) => (
                          <div
                            key={milestone}
                            className="absolute top-0 bottom-0 w-px bg-white/50"
                            style={{ left: `${milestone}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Target</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remaining</p>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(remainingAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Deadline
                      </span>
                      <span
                        className={`font-medium ${isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : isNearDeadline
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                      >
                        {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                        {goal.status === 'active' && (
                          <span className="ml-2 text-xs">
                            ({isOverdue ? 'overdue' : `${daysUntilDeadline}d left`})
                          </span>
                        )}
                      </span>
                    </div>

                    {goal.monthlyContribution && goal.monthlyContribution > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ArrowUpCircle className="w-4 h-4" />
                          Monthly
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(goal.monthlyContribution)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Alerts */}
                  {isOverdue && (
                    <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                          This goal is past its deadline
                        </p>
                      </div>
                    </div>
                  )}

                  {percentage >= 100 && goal.status === 'active' && (
                    <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                          Congratulations! You've reached your goal!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {goal.status === 'active' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setContributingGoal(goal)}
                          className="flex-1"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Contribution
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingGoal(goal)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        {percentage >= 100 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkAsCompleted(goal)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsCancelled(goal)}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {goal.status === 'completed' && (
                      <>
                        <div className="flex-1 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                          <Trophy className="w-4 h-4" />
                          Goal Completed!
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingGoalId(goal.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {goal.status === 'cancelled' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleReactivateGoal(goal)}
                          className="flex-1"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Reactivate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingGoalId(goal.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Goal"
        size="lg"
      >
        <GoalForm
          onSubmit={handleCreateGoal}
          onCancel={() => setShowAddModal(false)}
          isLoading={createGoal.isPending}
        />
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
        size="lg"
      >
        {editingGoal && (
          <GoalForm
            onSubmit={handleUpdateGoal}
            onCancel={() => setEditingGoal(null)}
            defaultValues={{
              name: editingGoal.name,
              description: editingGoal.description ?? undefined,
              targetAmount: editingGoal.targetAmount,
              currentAmount: editingGoal.currentAmount,
              deadline: new Date(editingGoal.deadline),
              categoryId: editingGoal.categoryId ?? undefined,
              priority: editingGoal.priority,
              linkedAccountId: editingGoal.linkedAccountId ?? undefined,
              monthlyContribution: editingGoal.monthlyContribution ?? undefined,
            }}
            isLoading={updateGoal.isPending}
            isEditing
          />
        )}
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        title="Add Contribution"
        size="lg"
      >
        {contributingGoal && (
          <ContributeForm
            goal={contributingGoal}
            onSubmit={handleContributeToGoal}
            onCancel={() => setContributingGoal(null)}
            isLoading={contributeToGoal.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleDeleteGoal}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone and all associated data will be lost."
        confirmLabel="Delete Goal"
        variant="danger"
        isLoading={deleteGoal.isPending}
      />
    </div>
  )
}
