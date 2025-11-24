import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { notificationService } from '@/services/api/notifications.service'
import type { NotificationDTO, NotificationFilters } from '@/types/dto'

/**
 * Get all notifications with optional filters
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(['notifications'])

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data?.map((n: NotificationDTO) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }
      })

      return { previousNotifications }
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
      showErrorToast(error, 'Failed to mark notification as read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to mark all as read')
    },
  })
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previousNotifications = queryClient.getQueryData(['notifications'])

      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data?.filter((n: NotificationDTO) => n.id !== id),
        }
      })

      return { previousNotifications }
    },
    onError: (error, _, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
      showErrorToast(error, 'Failed to delete notification')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Delete all read notifications
 */
export function useDeleteAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete notifications')
    },
  })
}
