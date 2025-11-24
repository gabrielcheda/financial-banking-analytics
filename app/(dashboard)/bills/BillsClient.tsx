'use client'

import { useState, useMemo, useEffect } from 'react'
import { useI18n } from '@/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BalanceDisplay } from '@/components/BalanceDisplay'
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
  X,
  Repeat,
  CreditCard,
} from 'lucide-react'
import { format, differenceInDays, startOfMonth, endOfMonth } from 'date-fns'
import {
  useBills,
  useUpcomingBills,
  useOverdueBills,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  usePayBill,
} from '@/hooks/useBills'
import { useActiveAccounts } from '@/hooks/useAccounts'
import { transactionService } from '@/services/api/transactions.service'
import { showErrorToast } from '@/lib/error-utils'
import type { BillDTO, CreateBillDTO, UpdateBillDTO } from '@/types/dto'
import { parseLocaleNumber } from '@/lib/numberUtils'

type TabType = 'all' | 'upcoming' | 'overdue' | 'paid'

export default function BillsClient() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBill, setEditingBill] = useState<BillDTO | null>(null)
  const [payingBill, setPayingBill] = useState<BillDTO | null>(null)
  const [paymentAccountId, setPaymentAccountId] = useState<string>('')
  const [isPaying, setIsPaying] = useState(false)

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
  const { data: activeAccounts = [], isLoading: accountsLoading } = useActiveAccounts()

  useEffect(() => {
    if (payingBill && !paymentAccountId && activeAccounts.length > 0) {
      const fallback = payingBill.accountId || activeAccounts[0].id
      setPaymentAccountId(fallback)
    }
  }, [payingBill, paymentAccountId, activeAccounts])

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
    const dateString =
      value instanceof Date
        ? format(value, 'yyyy-MM-dd')
        : (value ?? '').split('T')[0]

    if (!dateString) return ''

    // Use noon UTC to avoid timezone shifts
    return new Date(`${dateString}T12:00:00Z`).toISOString()
  }

  const parseBillDate = (value: string) => {
    if (!value) return new Date()
    const hasTime = value.includes('T')
    return new Date(hasTime ? value : `${value}T12:00:00Z`)
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
      merchantId: data.merchantId,
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
      merchantId: data.merchantId ?? editingBill.merchantId ?? undefined,
      categoryId: data.categoryId ?? editingBill.categoryId,
      accountId: data.accountId ?? editingBill.accountId,
      recurrence: data.isRecurring
        ? (data.frequency as 'weekly' | 'monthly' | 'yearly')
        : 'once',
      notes: data.notes,
    }
    await updateBill.mutateAsync({ id: editingBill.id, data: dto })
    setEditingBill(null)
  }

  const handleDeleteBill = async (id: string) => {
    if (confirm(t('bills.deleteConfirmation'))) {
      await deleteBill.mutateAsync(id)
    }
  }

  const handlePayBill = async () => {
    if (!payingBill || !paymentAccountId) return
    const amount = normalizeAmount(payingBill.amount)
    const categoryId = payingBill.categoryId ||
      (payingBill.merchant && (payingBill.merchant as any).category?.id)

    if (!categoryId) {
      showErrorToast(new Error('Missing category for this bill/merchant'), 'Cannot pay bill')
      return
    }

    try {
      setIsPaying(true)

      await payBill.mutateAsync({
        id: payingBill.id,
        data: {
          paymentDate: new Date().toISOString(),
          amount,
          accountId: paymentAccountId,
        },
      })

      setPayingBill(null)
      setPaymentAccountId('')
    } catch (error) {
      showErrorToast(error, 'Failed to pay bill')
    } finally {
      setIsPaying(false)
    }
  }

  const openPayModal = (bill: BillDTO) => {
    const fallbackAccount =
      bill.accountId ||
      activeAccounts.find((account) => account.id !== bill.accountId)?.id ||
      ''
    setPayingBill(bill)
    setPaymentAccountId(fallbackAccount)
  }

  const getDaysUntilDue = (dueDate: string): number => {
    return differenceInDays(parseBillDate(dueDate), new Date())
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
      label = t('bills.paid')
    } else if (status === 'overdue') {
      label = t('bills.daysOverdue', { days: Math.abs(daysUntil) })
    } else if (status === 'upcoming') {
      label = daysUntil === 0 ? t('bills.dueToday') : t('bills.dueInDays', { days: daysUntil })
    } else {
      label = t('bills.pending')
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
            {t('bills.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('bills.trackAndManage')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={createBill.isPending}
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('bills.addBill')}
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
                      {t('bills.upcoming7Days')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      <BalanceDisplay amount={stats.totalUpcoming ?? 0} showSign={false} />
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
                      {t('bills.overdue')}
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                      <BalanceDisplay amount={stats.totalOverdue ?? 0} showSign={false} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stats.overdueCount} {stats.overdueCount === 1 ? t('bills.bill') : t('bills.bills')}
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
                      {t('bills.paidThisMonth')}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                      <BalanceDisplay amount={Number(stats.totalPaid)} showSign={false} />
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
                      {t('bills.totalBills')}
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
              { id: 'all', label: t('bills.allBills'), count: allBills.length },
              { id: 'upcoming', label: t('bills.upcoming'), count: upcomingBills.length },
              { id: 'overdue', label: t('bills.overdue'), count: overdueBills.length },
              { id: 'paid', label: t('bills.paidThisMonth'), count: paidBills.length },
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
              title={activeTab === 'all' ? t('bills.noBills') : t('bills.noBillsFound', { tab: activeTab })}
              description={
                activeTab === 'all'
                  ? t('bills.createFirstBill')
                  : t('bills.noBillsDescription', { tab: activeTab, extra: activeTab === 'overdue' ? t('bills.greatJob') : '' })
              }
              action={
                activeTab === 'all'
                  ? {
                    label: t('bills.createBill'),
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
                      onClick={() => openPayModal(bill)}
                      disabled={payBill.isPending}
                      title={t('common.payBill')}
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
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('bills.amount')}</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        <BalanceDisplay amount={Number(bill.amount)} showSign={false} />
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('bills.dueDate')}</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {format(parseBillDate(bill.dueDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Merchant */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('bills.merchant')}</span>
                      <span className="text-gray-900 dark:text-white">
                        {bill.merchant?.name || bill.merchantId || t('common.na')}
                      </span>
                    </div>

                    {/* Recurring Info */}
                    {bill.recurrence !== 'once' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('bills.recurrence')}</span>
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
                            {t('bills.billOverdue', { days: Math.abs(daysUntil), unit: Math.abs(daysUntil) === 1 ? t('common.day') : t('common.days') })}
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
                {t('bills.createNewBill')}
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
                {t('bills.editBill')}: {editingBill.name}
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
                {t('bills.payBill')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPayingBill(null)
                  setPaymentAccountId('')
                }}
                disabled={payBill.isPending}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('bills.billName')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {payingBill.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('bills.amountDue')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <BalanceDisplay amount={payingBill.amount} showSign={false} />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('bills.dueDate')}</p>
                  <p className="text-gray-900 dark:text-white">
                    {format(parseBillDate(payingBill.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bills.paymentAccount')}</p>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('bills.selectAccount')}</option>
                    {activeAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                  </select>
                  {accountsLoading && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('common.loading')}...</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPayingBill(null)
                    setPaymentAccountId('')
                  }}
                  disabled={payBill.isPending || isPaying}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePayBill}
                  disabled={payBill.isPending || isPaying || !paymentAccountId}
                  className="flex-1"
                >
                  {payBill.isPending || isPaying ? t('bills.processing') : t('bills.confirmPayment')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
