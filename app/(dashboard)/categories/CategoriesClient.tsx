'use client'

import { useState } from 'react'
import { useI18n } from '@/i18n'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { CategoryForm } from '@/components/forms/CategoryForm'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories'
import { Plus, Edit, Trash2, Tag, Folder } from 'lucide-react'
import type { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '@/types/dto'

interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit'
  categoryId?: string
  defaultValues?: Partial<CreateCategoryDTO>
}

interface DeleteDialogState {
  isOpen: boolean
  categoryId?: string
  categoryName?: string
}

export default function CategoriesClient() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
  })
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({
    isOpen: false,
  })
  const [reassignCategoryId, setReassignCategoryId] = useState<string>('')

  const { data: categoriesData = [], isLoading } = useCategories(
    filter === 'all' ? undefined : { type: filter }
  )

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const categories = categoriesData
  const filteredForReassign = categories.filter(
    (cat) => cat.id !== deleteDialogState.categoryId
  )

  const handleCreateCategory = async (data: CreateCategoryDTO) => {
    await createMutation.mutateAsync(data)
    setModalState({ isOpen: false, mode: 'create' })
  }

  const handleUpdateCategory = async (data: UpdateCategoryDTO) => {
    if (!modalState.categoryId) return
    await updateMutation.mutateAsync({
      id: modalState.categoryId,
      data,
    })
    setModalState({ isOpen: false, mode: 'create' })
  }

  const handleDeleteCategory = async () => {
    if (!deleteDialogState.categoryId || !reassignCategoryId) return
    await deleteMutation.mutateAsync({
      id: deleteDialogState.categoryId,
      reassignTo: reassignCategoryId,
    })
    setDeleteDialogState({ isOpen: false })
    setReassignCategoryId('')
  }

  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      defaultValues: undefined,
    })
  }

  const openEditModal = (category: CategoryDTO) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      categoryId: category.id,
      defaultValues: {
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon || undefined,
      },
    })
  }

  const openDeleteDialog = (category: CategoryDTO) => {
    const fallbackCategory = categories.find((cat) => cat.id !== category.id)?.id ?? ''
    setReassignCategoryId(fallbackCategory)
    setDeleteDialogState({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
    })
  }

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('categories.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('categories.manage')}
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-5 h-5 mr-2" />
          {t('categories.addCategory')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          {t('categories.all')}
        </Button>
        <Button
          variant={filter === 'income' ? 'primary' : 'ghost'}
          onClick={() => setFilter('income')}
          size="sm"
        >
          {t('categories.income')}
        </Button>
        <Button
          variant={filter === 'expense' ? 'primary' : 'ghost'}
          onClick={() => setFilter('expense')}
          size="sm"
        >
          {t('categories.expense')}
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={t('categories.noCategories')}
          description={t('categories.createFirst')}
          action={{
            label: t('categories.addCategory'),
            onClick: openCreateModal,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      {category.icon || <Folder />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {category.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label={t('common.edit')}
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    {category.isCustom && (
                      <button
                        onClick={() => openDeleteDialog(category)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        title={modalState.mode === 'create' ? t('categories.addCategory') : t('categories.editCategory')}
        size="lg"
      >
        <CategoryForm
          onSubmit={
            modalState.mode === 'create'
              ? handleCreateCategory
              : handleUpdateCategory
          }
          onCancel={() => setModalState({ isOpen: false, mode: 'create' })}
          defaultValues={modalState.defaultValues}
          isLoading={isMutating}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteDialogState.isOpen}
        onClose={() => setDeleteDialogState({ isOpen: false })}
        title={t('categories.deleteCategory')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('categories.deleteConfirmation', { name: deleteDialogState.categoryName! })}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('categories.reassignTo')}: <span className="text-red-500">*</span>
            </label>
            <select
              value={reassignCategoryId}
              onChange={(e) => setReassignCategoryId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('categories.selectCategory')}</option>
              {filteredForReassign.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon && `${cat.icon} `}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogState({ isOpen: false })}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCategory}
              disabled={!reassignCategoryId || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('categories.deleteCategory')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
