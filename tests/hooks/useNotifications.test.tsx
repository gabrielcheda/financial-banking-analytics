/**
 * Tests for useNotifications hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useDeleteNotification,
  useDeleteAllRead 
} from '@/hooks/useNotifications'
import { notificationService } from '@/services/api/notifications.service'
import * as errorUtils from '@/lib/error-utils'
import type { NotificationDTO, NotificationFilters } from '@/types/dto'

// Mock services
vi.mock('@/services/api/notifications.service')
vi.mock('@/lib/error-utils')

describe('useNotifications Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useNotifications', () => {
    it('should fetch notifications without filters', async () => {
      const mockNotifications: NotificationDTO[] = [
        {
          id: '1',
          userId: 'user-1',
          title: 'Payment Due',
          message: 'Your electricity bill is due tomorrow',
          type: 'bill' as const,
          isRead: false,
          createdAt: new Date('2024-02-10'),
        },
      ]

      vi.mocked(notificationService.getNotifications).mockResolvedValue(mockNotifications)

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockNotifications)
      expect(notificationService.getNotifications).toHaveBeenCalledWith(undefined)
    })

    it('should fetch notifications with filters', async () => {
      const mockNotifications: NotificationDTO[] = []
      const filters: NotificationFilters = { isRead: false, type: 'bill' }
      
      vi.mocked(notificationService.getNotifications).mockResolvedValue(mockNotifications)

      const { result } = renderHook(() => useNotifications(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(notificationService.getNotifications).toHaveBeenCalledWith(filters)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(notificationService.getNotifications).mockRejectedValue(mockError)

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUnreadCount', () => {
    it('should fetch unread count', async () => {
      const mockCount = { count: 5 }
      vi.mocked(notificationService.getUnreadCount).mockResolvedValue(mockCount)

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCount)
      expect(notificationService.getUnreadCount).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(notificationService.getUnreadCount).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useMarkAsRead', () => {
    it('should mark notification as read with optimistic update', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockNotification: NotificationDTO = {
        id: '1',
        userId: 'user-1',
        title: 'Test',
        message: 'Test message',
        type: 'bill' as const,
        isRead: true,
        createdAt: new Date(),
      }

      vi.mocked(notificationService.markAsRead).mockResolvedValue(mockNotification)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useMarkAsRead(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(notificationService.markAsRead).toHaveBeenCalledWith('1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] })
    })

    it('should handle mark as read error and rollback', async () => {
      const mockError = new Error('Mark failed')
      vi.mocked(notificationService.markAsRead).mockRejectedValue(mockError)

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to mark notification as read')
    })
  })

  describe('useMarkAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.mocked(notificationService.markAllAsRead).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useMarkAllAsRead(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(notificationService.markAllAsRead).toHaveBeenCalled()
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] })
    })

    it('should handle mark all error', async () => {
      const mockError = new Error('Mark all failed')
      vi.mocked(notificationService.markAllAsRead).mockRejectedValue(mockError)

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(),
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to mark all as read')
    })
  })

  describe('useDeleteNotification', () => {
    it('should delete notification with optimistic update', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.mocked(notificationService.deleteNotification).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteNotification(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(notificationService.deleteNotification).toHaveBeenCalledWith('1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] })
    })

    it('should handle delete error and rollback', async () => {
      const mockError = new Error('Delete failed')
      vi.mocked(notificationService.deleteNotification).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to delete notification')
    })
  })

  describe('useDeleteAllRead', () => {
    it('should delete all read notifications', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.mocked(notificationService.deleteAllRead).mockResolvedValue({ success: true, deleted: 5 })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteAllRead(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(notificationService.deleteAllRead).toHaveBeenCalled()
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] })
    })

    it('should handle delete all read error', async () => {
      const mockError = new Error('Delete all failed')
      vi.mocked(notificationService.deleteAllRead).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteAllRead(), {
        wrapper: createWrapper(),
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to delete notifications')
    })
  })
})
