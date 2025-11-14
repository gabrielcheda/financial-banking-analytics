'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Info,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllRead,
} from '@/hooks/useNotifications'
import type { NotificationDTO } from '@/types/dto'

const notificationTypeConfig = {
  bill: {
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  budget: {
    icon: TrendingDown,
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  goal: {
    icon: Target,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  transaction: {
    icon: TrendingUp,
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  system: {
    icon: Info,
    color: 'text-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-900/30',
  },
}

const priorityConfig = {
  high: {
    color: 'border-red-500',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  medium: {
    color: 'border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  low: {
    color: 'border-gray-300 dark:border-gray-700',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
}

export default function NotificationsClient() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationDTO['type'] | 'all'>('all')

  const { data: notificationsData, isLoading } = useNotifications({
    unreadOnly: filter === 'unread',
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteAllRead = useDeleteAllRead()

  const notifications = notificationsData?.data || []
  const unreadCount = notificationsData?.pagination.unreadCount || 0

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    if (confirm('Mark all notifications as read?')) {
      markAllAsRead.mutate()
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this notification?')) {
      deleteNotification.mutate(id)
    }
  }

  const handleDeleteAllRead = () => {
    if (confirm('Delete all read notifications?')) {
      deleteAllRead.mutate()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

          <Button
            variant={typeFilter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            <Filter className="w-4 h-4 mr-1" />
            All Types
          </Button>
          <Button
            variant={typeFilter === 'bill' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('bill')}
          >
            Bills
          </Button>
          <Button
            variant={typeFilter === 'budget' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('budget')}
          >
            Budgets
          </Button>
          <Button
            variant={typeFilter === 'goal' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTypeFilter('goal')}
          >
            Goals
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAllRead}
            disabled={deleteAllRead.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description={
            filter === 'unread'
              ? 'You have no unread notifications'
              : 'You have no notifications yet'
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const typeConfig = notificationTypeConfig[notification.type]
            const TypeIcon = typeConfig.icon
            const priorityStyle = priorityConfig[notification.priority]

            return (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md border-l-4 ${
                  !notification.isRead
                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                    : 'bg-white dark:bg-gray-900'
                } ${priorityStyle.color}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg ${typeConfig.bg} flex-shrink-0`}
                    >
                      <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.badge}`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <span>
                              {format(
                                new Date(notification.createdAt),
                                'MMM dd, yyyy • HH:mm'
                              )}
                            </span>
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsRead.isPending}
                              className="h-8 w-8 p-0"
                              aria-label="Mark as read"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={deleteNotification.isPending}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                            aria-label="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Action URL */}
                      {notification.actionUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            (window.location.href = notification.actionUrl!)
                          }
                          className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                          View Details →
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
