'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BillForm } from '@/components/forms/BillForm'
import {
  Plus,
  Pencil,
  Trash2,
  Receipt,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Repeat,
  CreditCard,
} from 'lucide-react'
import { format, differenceInDays, startOfMonth, endOfMonth, addDays } from 'date-fns'
import {
  useBills,
  useUpcomingBills,
  useOverdueBills,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  usePayBill,
} from '@/hooks/useBills'
import type { BillDTO, CreateBillDTO, UpdateBillDTO, PayBillDTO } from '@/types/dto'
import { parseLocaleNumber } from '@/lib/numberUtils'

type TabType = 'all' | 'upcoming' | 'overdue' | 'paid'

export default function BillsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBill, setEditingBill] = useState<BillDTO | null>(null)
  const [payingBill, setPayingBill] = useState<BillDTO | null>(null)

  // Get current month date range
  const currentMonth = useMemo(() => {
    const now = new Date()
    return {
      start: format(startOfMonth(now), 'yyyy-MM-dd'),
      end: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  }, [])

  // Hooks
  const { data: allBillsData, isLoading: loadingAll } = useBills()
  const { data: upcomingBillsData, isLoading: loadingUpcoming } = useUpcomingBills(7)
  const { data: overdueBillsData, isLoading: loadingOverdue } = useOverdueBills()
  const { data: paidBillsData, isLoading: loadingPaid } = useBills({
    isPaid: true,
    startDate: currentMonth.start,
    endDate: currentMonth.end,
  })

  const createBill = useCreateBill()
  const updateBill = useUpdateBill()
  const deleteBill = useDeleteBill()
  const payBill = usePayBill()

  const normalizeAmount = (value: number | string | null | undefined) => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return Number(value.toFixed(2))
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = parseLocaleNumber(value)
      if (typeof parsed === 'number' && !Number.isNaN(parsed)) {
        return Number(parsed.toFixed(2))
      }
    }

    return 0
  }

  const normalizeDate = (value: string | Date) => {
    if (value instanceof Date) {
      return format(value, 'yyyy-MM-dd')
    }
    return value.split('T')[0]
  }

  // Get data from API response
  const allBills = allBillsData || []
  const upcomingBills = upcomingBillsData || []
  const overdueBills = overdueBillsData || []
  const paidBills = paidBillsData || []

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUpcoming = (upcomingBills || []).reduce((sum: number, b: BillDTO) => sum + Number(b.amount), 0)
    const totalOverdue = (overdueBills || []).reduce((sum: number, b: BillDTO) => sum + Number(b.amount), 0)
    const totalPaid = (paidBills || []).reduce((sum: number, b: BillDTO) => {
      if (b.isPaid)
        return sum + Number(b.amount);

      return sum;
    }, 0)
    const overdueCount = (overdueBills || []).length

    return {
      totalUpcoming,
      totalOverdue,
      totalPaid,
      overdueCount,
    }
  }, [upcomingBills, overdueBills, paidBills])

  // Get bills based on active tab
  const { bills, isLoading } = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return { bills: upcomingBills, isLoading: loadingUpcoming }
      case 'overdue':
        return { bills: overdueBills, isLoading: loadingOverdue }
      case 'paid':
        return { bills: paidBills, isLoading: loadingPaid }
      default:
        return { bills: allBills, isLoading: loadingAll }
    }
  }, [activeTab, allBills, upcomingBills, overdueBills, paidBills, loadingAll, loadingUpcoming, loadingOverdue, loadingPaid])

  // Handlers
  const handleCreateBill = async (data: any) => {
    // Transform form data to DTO format
    const dto: CreateBillDTO = {
      name: data.name,
      amount: normalizeAmount(data.amount),
      dueDate: normalizeDate(data.dueDate),
      categoryId: data.categoryId,
      accountId: data.accountId,
      recurrence: data.isRecurring
        ? (data.frequency as 'weekly' | 'monthly' | 'yearly')
        : 'once',
      notes: data.notes,
    }
    await createBill.mutateAsync(dto)
    setShowAddModal(false)
  }

  const handleUpdateBill = async (data: any) => {
    if (!editingBill) return
    // Transform form data to DTO format
    const dto: UpdateBillDTO = {
      name: data.name,
      amount: normalizeAmount(data.amount ?? editingBill.amount),
      dueDate: data.dueDate ? normalizeDate(data.dueDate) : undefined,
      categoryId: data.categoryId,
      accountId: data.accountId,
      recurrence: data.isRecurring
        ? (data.frequency as 'weekly' | 'monthly' | 'yearly')
        : 'once',
      notes: data.notes,
    }
    await updateBill.mutateAsync({ id: editingBill.id, data: dto })
    setEditingBill(null)
  }

  const handleDeleteBill = async (id: string) => {
    if (confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      await deleteBill.mutateAsync(id)
    }
  }

  const handlePayBill = async (data: PayBillDTO) => {
    if (!payingBill) return
    await payBill.mutateAsync({ id: payingBill.id, data })
    setPayingBill(null)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = amount ?? 0
    return `$${Math.abs(safeAmount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getDaysUntilDue = (dueDate: string): number => {
    return differenceInDays(new Date(dueDate), new Date())
  }

  const getBillStatus = (bill: BillDTO) => {
    if (bill.isPaid) return 'paid'
    const daysUntil = getDaysUntilDue(bill.dueDate)
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 7) return 'upcoming'
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'overdue':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'upcoming':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getStatusBadge = (bill: BillDTO) => {
    const status = getBillStatus(bill)
    const daysUntil = getDaysUntilDue(bill.dueDate)

    let label = ''
    if (status === 'paid') {
      label = 'Paid'
    } else if (status === 'overdue') {
      label = `${Math.abs(daysUntil)} days overdue`
    } else if (status === 'upcoming') {
      label = daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} days`
    } else {
      label = 'Pending'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bills
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your bills and payments
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={createBill.isPending}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingAll ? (
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
                      Upcoming (7 days)
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.totalUpcoming)}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Overdue
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                      {formatCurrency(stats.totalOverdue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stats.overdueCount} {stats.overdueCount === 1 ? 'bill' : 'bills'}
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Paid This Month
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                      {formatCurrency(Number(stats.totalPaid))}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Bills
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {allBills.length}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Bills', count: allBills.length },
              { id: 'upcoming', label: 'Upcoming', count: upcomingBills.length },
              { id: 'overdue', label: 'Overdue', count: overdueBills.length },
              { id: 'paid', label: 'Paid This Month', count: paidBills.length },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as TabType)}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
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
      ) : bills.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Receipt}
              title={`No ${activeTab === 'all' ? '' : activeTab} Bills Found`}
              description={
                activeTab === 'all'
                  ? "You haven't created any bills yet. Set up your first bill to start tracking your payments!"
                  : `No ${activeTab} bills found. ${activeTab === 'overdue' ? 'Great job staying on top of your payments!' : ''}`
              }
              action={
                activeTab === 'all'
                  ? {
                    label: 'Create Bill',
                    onClick: () => setShowAddModal(true),
                  }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(bills || []).map((bill: BillDTO) => {
            const status = getBillStatus(bill)
            const daysUntil = getDaysUntilDue(bill.dueDate)

            return (
              <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{bill.name}</CardTitle>
                      {bill.recurrence !== 'once' && (
                        <Repeat className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    {getStatusBadge(bill)}
                  </div>
                  <div className="flex gap-1">
                    {!bill.isPaid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPayingBill(bill)}
                        disabled={payBill.isPending}
                        title="Pay bill"
                      >
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBill(bill)}
                      disabled={updateBill.isPending}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBill(bill.id)}
                      disabled={deleteBill.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(Number(bill.amount))}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Category ID</span>
                      <span className="text-gray-900 dark:text-white">{bill.categoryId}</span>
                    </div>

                    {/* Recurring Info */}
                    {bill.recurrence !== 'once' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Recurrence</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {bill.recurrence}
                        </span>
                      </div>
                    )}

                    {/* Warning for overdue */}
                    {status === 'overdue' && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <p className="text-xs text-red-800 dark:text-red-300">
                            This bill is {Math.abs(daysUntil)} {Math.abs(daysUntil) === 1 ? 'day' : 'days'} overdue
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {bill.notes && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                        {bill.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Bill
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                disabled={createBill.isPending}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <BillForm
                onSubmit={handleCreateBill}
                onCancel={() => setShowAddModal(false)}
                isLoading={createBill.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {editingBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Bill: {editingBill.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingBill(null)}
                disabled={updateBill.isPending}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <BillForm
                onSubmit={handleUpdateBill}
                onCancel={() => setEditingBill(null)}
                defaultValues={{
                  amount: editingBill.amount,
                }}
                isLoading={updateBill.isPending}
                isEditing
              />
            </div>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {payingBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pay Bill
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPayingBill(null)}
                disabled={payBill.isPending}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bill Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {payingBill.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount Due</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payingBill.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(payingBill.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPayingBill(null)}
                  disabled={payBill.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    handlePayBill({
                      paymentDate: new Date().toISOString(),
                    })
                  }
                  disabled={payBill.isPending}
                  className="flex-1"
                >
                  {payBill.isPending ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
