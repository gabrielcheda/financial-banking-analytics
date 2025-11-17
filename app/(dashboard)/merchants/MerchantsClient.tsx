'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { MerchantForm } from '@/components/forms/MerchantForm'
import {
  useMerchants,
  useCreateMerchant,
  useUpdateMerchant,
  useDeleteMerchant,
  useMerchantStats,
} from '@/hooks/useMerchants'
import { Plus, Store, Edit, Trash2, MapPin, Phone, Tag } from 'lucide-react'
import type { MerchantDTO } from '@/types/dto'

export default function MerchantsClient() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDTO | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data
  const { data: merchants = [], isLoading } = useMerchants()
  const { data: stats } = useMerchantStats()

  // Mutations
  const createMutation = useCreateMerchant()
  const updateMutation = useUpdateMerchant()
  const deleteMutation = useDeleteMerchant()

  // Filter merchants by search
  const filteredMerchants = merchants.filter((merchant) =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data)
    setShowAddModal(false)
  }

  const handleUpdate = async (data: any) => {
    if (!selectedMerchant) return
    await updateMutation.mutateAsync({ id: selectedMerchant.id, data })
    setShowEditModal(false)
    setSelectedMerchant(null)
  }

  const handleDelete = async () => {
    if (!selectedMerchant) return
    await deleteMutation.mutateAsync(selectedMerchant.id)
    setShowDeleteModal(false)
    setSelectedMerchant(null)
  }

  const openEditModal = (merchant: MerchantDTO) => {
    setSelectedMerchant(merchant)
    setShowEditModal(true)
  }

  const openDeleteModal = (merchant: MerchantDTO) => {
    setSelectedMerchant(merchant)
    setShowDeleteModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Merchants</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your favorite stores and establishments
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Merchants</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalMerchants}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.merchantsByCategory.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Top Merchant</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {stats.topMerchants[0]?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.topMerchants[0]?.transactionCount || 0} transactions
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <input
            type="text"
            placeholder="Search merchants by name, city, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </CardContent>
      </Card>

      {/* Merchants List */}
      <Card>
        <CardHeader>
          <CardTitle>All Merchants ({filteredMerchants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredMerchants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: merchant.color }}
                      >
                        {merchant.icon || '🏪'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {merchant.name}
                        </h3>
                        {merchant.category && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Tag className="w-3 h-3" />
                            {merchant.category.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-3">
                    {merchant.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {merchant.phone}
                      </p>
                    )}
                    {merchant.location?.city && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {merchant.location.city}
                        {merchant.location.state && `, ${merchant.location.state}`}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(merchant)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteModal(merchant)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Store}
              title="No Merchants Found"
              description={
                searchQuery
                  ? "No merchants match your search criteria"
                  : "Create your first merchant to get started"
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Merchant"
      >
        <MerchantForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddModal(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMerchant(null)
        }}
        title="Edit Merchant"
      >
        {selectedMerchant && (
          <MerchantForm
            merchant={selectedMerchant}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedMerchant(null)
            }}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedMerchant(null)
        }}
        title="Delete Merchant"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>{selectedMerchant?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. Transactions associated with this merchant will not be deleted,
            but the merchant reference will be removed.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedMerchant(null)
              }}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
