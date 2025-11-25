/**
 * Tests for User Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userService } from '@/services/api/user.service'
import { apiClient } from '@/services/api/client'
import type { UserDTO, UserPreferencesDTO, UpdateProfileDTO, UpdatePreferencesDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const mockUser: UserDTO = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const mockResponse = {
        success: true,
        data: mockUser,
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await userService.getProfile()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })

    it('should handle profile fetch error', async () => {
      const mockError = new Error('Unauthorized')
      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(userService.getProfile()).rejects.toThrow('Unauthorized')
    })
  })

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData: UpdateProfileDTO = {
        name: 'Updated Name',
      }

      const mockUser: UserDTO = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const mockResponse = {
        success: true,
        data: mockUser,
      }

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await userService.updateProfile(updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', updateData)
      expect(result).toEqual(mockUser)
    })

    it('should handle update profile error', async () => {
      const updateData: UpdateProfileDTO = {
        name: 'Updated Name',
      }

      const mockError = new Error('Validation error')
      vi.mocked(apiClient.put).mockRejectedValue(mockError)

      await expect(userService.updateProfile(updateData)).rejects.toThrow('Validation error')
    })
  })

  describe('getPreferences', () => {
    it('should get user preferences', async () => {
      const mockPreferences: UserPreferencesDTO = {
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
      }

      const mockResponse = {
        success: true,
        data: mockPreferences,
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await userService.getPreferences()

      expect(apiClient.get).toHaveBeenCalledWith('/users/preferences')
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const updateData: UpdatePreferencesDTO = {
        theme: 'light',
        language: 'pt',
      }

      const mockPreferences: UserPreferencesDTO = {
        theme: 'light',
        language: 'pt',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
      }

      const mockResponse = {
        success: true,
        data: mockPreferences,
      }

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await userService.updatePreferences(updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/users/preferences', updateData)
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }

      const mockResponse = {
        success: true,
        data: { message: 'Password changed successfully' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await userService.changePassword(passwordData)

      expect(apiClient.post).toHaveBeenCalledWith('/users/change-password', passwordData)
      expect(result).toEqual({ message: 'Password changed successfully' })
    })
  })

  describe('uploadAvatar', () => {
    it('should upload avatar', async () => {
      const base64Image = 'data:image/png;base64,iVBORw0KG...'

      const mockUser: UserDTO = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: base64Image,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const mockResponse = {
        success: true,
        data: mockUser,
      }

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await userService.uploadAvatar(base64Image)

      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', { avatar: base64Image })
      expect(result).toEqual(mockUser)
    })
  })

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const password = 'my-password'

      const mockResponse = {
        success: true,
        data: { message: 'Account deleted successfully' },
      }

      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)

      const result = await userService.deleteAccount(password)

      expect(apiClient.delete).toHaveBeenCalledWith('/users/account', {
        data: { password },
      })
      expect(result).toEqual({ message: 'Account deleted successfully' })
    })

    it('should handle delete account error', async () => {
      const password = 'wrong-password'

      const mockError = new Error('Invalid password')
      vi.mocked(apiClient.delete).mockRejectedValue(mockError)

      await expect(userService.deleteAccount(password)).rejects.toThrow('Invalid password')
    })
  })
})
