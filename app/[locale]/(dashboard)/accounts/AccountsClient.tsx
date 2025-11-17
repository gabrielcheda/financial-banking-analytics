'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { AccountForm } from '@/components/forms/AccountForm'
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

interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit'
  accountId?: string
  defaultValues?: Partial<CreateAccountDTO>
}

export default function AccountsClient() {
  const locale = useLocale()
  const tAccounts = useTranslations('accounts')
  const tActions = useTranslations('common.actions')
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

  // Fetch data
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts()
  const { data: summary, isLoading: summaryLoading } = useAccountSummary()

  // Mutations
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()

  // Extract accounts array
  const accounts = accountsResponse || []

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
    await deleteMutation.mutateAsync(deleteDialogState.accountId)
    setDeleteDialogState({ isOpen: false })
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
            {tAccounts('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {tAccounts('subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-5 h-5 mr-2" />
          {tAccounts('actions.add')}
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
                      {tAccounts('summary.totalBalance')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ${summary?.totalBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
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
                      {tAccounts('summary.activeAccounts')}
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
                      {tAccounts('summary.totalAssets')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ${summary?.totalAssets?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
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
                      {tAccounts('summary.netWorth')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ${summary?.netWorth?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
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
              title={tAccounts('empty.title')}
              description={tAccounts('empty.description')}
              action={{
                label: tAccounts('empty.action'),
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
                        aria-label="Edit account"
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(account)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete account"
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
                      {tAccounts('fields.currentBalance')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {account.currency}
                    </p>
                  </div>

                  {/* Institution and Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {account.institution || tAccounts('fields.noInstitution')}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${account.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                      {account.isActive ? tAccounts('fields.status.active') : tAccounts('fields.status.inactive')}
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
        title={modalState.mode === 'create' ? tAccounts('modals.createTitle') : tAccounts('modals.editTitle')}
        size="lg"
      >
        <AccountForm
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
      <ConfirmDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() => setDeleteDialogState({ isOpen: false })}
        onConfirm={handleDeleteAccount}
        title={tAccounts('modals.deleteTitle')}
        description={tAccounts('modals.deleteDescription', { name: deleteDialogState.accountName ?? '' })}
        confirmLabel={tAccounts('modals.deleteConfirm')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
