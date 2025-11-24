import { apiClient } from './client'
import type {
  NotificationDTO,
  NotificationFilters,
  NotificationPaginatedResponse,
  ApiResponse,
} from '@/types/dto'

class NotificationService {
  private readonly baseURL = '/notifications'

  /**
   * Get all notifications with optional filters
   */
  async getNotifications(filters?: NotificationFilters): Promise<NotificationPaginatedResponse> {
    const params = new URLSearchParams()

    if (filters?.unreadOnly) {
      params.append('unreadOnly', 'true')
    }
    if (filters?.type) {
      params.append('type', filters.type)
    }
    if (filters?.page !== undefined && filters.page !== null && !isNaN(filters.page)) {
      params.append('page', String(Math.floor(filters.page)))
    }
    if (filters?.limit !== undefined && filters.limit !== null && !isNaN(filters.limit)) {
      params.append('limit', String(Math.floor(filters.limit)))
    }

    const queryString = params.toString()
    const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL

    return await apiClient.get<NotificationPaginatedResponse>(url)
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.getNotifications({ unreadOnly: true, limit: 1 })
    return response.pagination.unreadCount
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.patch<ApiResponse<{ message: string }>>(
      `${this.baseURL}/${id}/read`
    )
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ message: string; count: number }>> {
    return await apiClient.patch<ApiResponse<{ message: string; count: number }>>(
      `${this.baseURL}/read-all`
    )
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete<ApiResponse<{ message: string }>>(
      `${this.baseURL}/${id}`
    )
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<ApiResponse<{ message: string; count: number }>> {
    return await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      `${this.baseURL}/read`
    )
  }
}

export const notificationService = new NotificationService()
