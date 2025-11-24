'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useI18n } from '@/i18n'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/ui/Modal'
import {
  useAccounts,
  useAccountSummary,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '@/hooks/useAccounts'
import {
  Plus,
  Wallet,
  Edit,
  Trash2,
  Building2,
  TrendingUp,
  DollarSign,
  CreditCard,
  Landmark,
} from 'lucide-react'
import type { AccountDTO, CreateAccountDTO, UpdateAccountDTO } from '@/types/dto'

type AccountType = 'checking' | 'savings' | 'credit' | 'investment'

const ACCOUNT_TYPE_ICONS: Record<AccountType, typeof Wallet> = {
  checking: Wallet,
  savings: Landmark,
  credit: CreditCard,
  investment: TrendingUp,
}

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  checking: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  savings: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  credit: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  investment: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
}

const DynamicAccountForm = dynamic(
  () => import('@/components/forms/AccountForm').then((mod) => mod.AccountForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {[...Array(4)].map((_, idx) => (
          <Skeleton key={idx} className="h-10 w-full" />
        ))}
      </div>
    ),
  }
)

interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit'
  accountId?: string
  defaultValues?: Partial<CreateAccountDTO>
}

export default function AccountsClient() {
  const { t } = useI18n()
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
  })
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean
    accountId?: string
    accountName?: string
  }>({
    isOpen: false,
  })
  const [transferAccountId, setTransferAccountId] = useState<string>('')

  // Fetch data
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts()
  const { data: summary, isLoading: summaryLoading } = useAccountSummary()

  // Mutations
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()

  // Extract accounts array
  const accounts = accountsResponse || []
  const availableTransferAccounts = accounts.filter(
    (acct) => acct.id !== deleteDialogState.accountId
  )

  // Handle create account
  const handleCreateAccount = async (data: CreateAccountDTO) => {
    await createMutation.mutateAsync(data)
    setModalState({ isOpen: false, mode: 'create' })
  }

  // Handle update account
  const handleUpdateAccount = async (data: UpdateAccountDTO) => {
    if (!modalState.accountId) return
    await updateMutation.mutateAsync({
      id: modalState.accountId,
      data,
    })
    setModalState({ isOpen: false, mode: 'create' })
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deleteDialogState.accountId) return
    const requiresTransfer = availableTransferAccounts.length > 0
    if (requiresTransfer && !transferAccountId) return

    await deleteMutation.mutateAsync({
      id: deleteDialogState.accountId,
      transferToAccountId: transferAccountId || undefined,
    })
    setDeleteDialogState({ isOpen: false })
    setTransferAccountId('')
  }

  // Open create modal
  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      defaultValues: undefined,
    })
  }

  // Open edit modal
  const openEditModal = (account: AccountDTO) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      accountId: account.id,
      defaultValues: {
        name: account.name,
        type: account.type,
        currency: account.currency,
        institution: account.institution || undefined,
        balance: account.balance,
      },
    })
  }

  // Open delete dialog
  const openDeleteDialog = (account: AccountDTO) => {
    const fallbackTarget = accounts.find((acct) => acct.id !== account.id)?.id ?? ''
    setTransferAccountId(fallbackTarget)
    setDeleteDialogState({
      isOpen: true,
      accountId: account.id,
      accountName: account.name,
    })
  }

  const isLoading = accountsLoading || summaryLoading
  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('accounts.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('accounts.manageAccounts')}
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-5 h-5 mr-2" />
          {t('accounts.addAccount')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      {t('accounts.totalBalance')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      <BalanceDisplay amount={summary?.totalBalance ?? 0} />
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('accounts.totalAccounts')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {accounts.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('accounts.totalAssets')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      $<BalanceDisplay amount={summary?.totalAssets ?? 0} showSign={false} />
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
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
                      {t('accounts.netWorth')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      $<BalanceDisplay amount={summary?.netWorth ?? 0} showSign={false} />
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Accounts Grid */}
      {accountsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !accountsLoading && accounts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Wallet}
              title={t('empty.noAccounts')}
              description={t('accounts.createFirstAccount')}
              action={{
                label: t('accounts.addAccount'),
                onClick: openCreateModal,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account: AccountDTO) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type as AccountType] || Wallet
            const colorClass = ACCOUNT_TYPE_COLORS[account.type as AccountType] || ACCOUNT_TYPE_COLORS.checking

            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header with Icon and Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(account)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label={t('common.edit')}
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(account)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Account Name and Type */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {account.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {account.type.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('accounts.currentBalance')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      <BalanceDisplay amount={account.balance ?? 0} currency={account.currency} />
                    </p>
                  </div>

                  {/* Institution and Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {account.institution || t('accounts.noInstitution')}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${account.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                      {account.isActive
                        ? t('accounts.active')
                        : t('accounts.inactive')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        title={
          modalState.mode === 'create'
            ? t('accounts.addAccount')
            : t('accounts.editAccount')
        }
        size="lg"
      >
        <DynamicAccountForm
          onSubmit={
            modalState.mode === 'create'
              ? handleCreateAccount
              : handleUpdateAccount
          }
          onCancel={() => setModalState({ isOpen: false, mode: 'create' })}
          defaultValues={modalState.defaultValues}
          isLoading={isMutating}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteDialogState.isOpen}
        onClose={() => {
          setDeleteDialogState({ isOpen: false })
          setTransferAccountId('')
        }}
        title={t('accounts.deleteAccount')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('accounts.deleteConfirmation', { name: deleteDialogState.accountName ?? '' })}
          </p>

          {availableTransferAccounts.length === 0 ? (
            <div className="p-3 rounded-md border border-yellow-300 bg-yellow-50 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
              {t('accounts.transferWarning')}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('accounts.transferDataTo')} <span className="text-red-500">*</span>
              </label>
              <select
                value={transferAccountId}
                onChange={(e) => setTransferAccountId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('accounts.selectDestination')}</option>
                {availableTransferAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('accounts.transferDescription')}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogState({ isOpen: false })
                setTransferAccountId('')
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={
                deleteMutation.isPending ||
                availableTransferAccounts.length === 0 ||
                !transferAccountId
              }
            >
              {deleteMutation.isPending ? t('common.deleting') : t('accounts.deleteAccount')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
