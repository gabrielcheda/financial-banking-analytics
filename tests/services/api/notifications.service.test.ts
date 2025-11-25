/**
 * Tests for Notifications Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { notificationService } from '@/services/api/notifications.service'
import { apiClient } from '@/services/api/client'
import type { NotificationDTO, NotificationFilters, NotificationPaginatedResponse } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Notifications Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('should get all notifications without filters', async () => {
      const mockResponse: NotificationPaginatedResponse = {
        data: [
          {
            id: '1',
            userId: 'user-1',
            type: 'budget_alert' as const,
            title: 'Budget Alert',
            message: 'You have exceeded your budget',
            isRead: false,
            createdAt: new Date('2024-01-01'),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          unreadCount: 1,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await notificationService.getNotifications()

      expect(apiClient.get).toHaveBeenCalledWith('/notifications')
      expect(result).toEqual(mockResponse)
    })

    it('should get notifications with filters', async () => {
      const filters: NotificationFilters = {
        unreadOnly: true,
        type: 'budget_alert',
        page: 1,
        limit: 10,
      }

      const mockResponse: NotificationPaginatedResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          unreadCount: 0,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await notificationService.getNotifications(filters)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getUnreadCount', () => {
    it('should get unread count', async () => {
      const mockResponse: NotificationPaginatedResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 1,
          total: 5,
          totalPages: 5,
          hasNext: false,
          hasPrev: false,
          unreadCount: 5,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await notificationService.getUnreadCount()

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toBe(5)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResponse = { success: true, data: { message: 'Notification marked as read' } }

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse)

      const result = await notificationService.markAsRead('notif-1')

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/notif-1/read')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = { success: true, data: { message: 'All notifications marked as read', count: 5 } }

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse)

      const result = await notificationService.markAllAsRead()

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read-all')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockResponse = { success: true, data: { message: 'Notification deleted' } }

      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)

      const result = await notificationService.deleteNotification('notif-1')

      expect(apiClient.delete).toHaveBeenCalledWith('/notifications/notif-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteAllRead', () => {
    it('should delete all read notifications', async () => {
      const mockResponse = { success: true, data: { message: 'All read notifications deleted', count: 3 } }

      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)

      const result = await notificationService.deleteAllRead()

      expect(apiClient.delete).toHaveBeenCalledWith('/notifications/read')
      expect(result).toEqual(mockResponse)
    })
  })
})
