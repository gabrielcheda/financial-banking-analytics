/**
 * Tests for Auth Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import authService from '@/services/api/auth.service'
import { apiClient } from '@/services/api/client'
import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully and save tokens', async () => {
      const loginData: LoginDTO = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 3600,
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authService.login(loginData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData)
      expect(result).toEqual(mockResponse.data)
      expect(localStorage.getItem('rememberMe')).toBe('true')
    })

    it('should login without rememberMe', async () => {
      const loginData: LoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 3600,
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await authService.login(loginData)

      expect(localStorage.getItem('rememberMe')).toBeNull()
    })

    it('should handle login error', async () => {
      const loginData: LoginDTO = {
        email: 'test@example.com',
        password: 'wrong-password',
      }

      const mockError = new Error('Invalid credentials')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should register successfully and save tokens', async () => {
      const registerData: RegisterDTO = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'new@example.com',
            name: 'New User',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 3600,
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authService.register(registerData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle registration error', async () => {
      const registerData: RegisterDTO = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
      }

      const mockError = new Error('Email already exists')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(authService.register(registerData)).rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await authService.logout()

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should handle logout error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(authService.logout()).rejects.toThrow('Network error')
    })
  })

  describe('refreshToken', () => {
    it('should handle refresh error when no token (httpOnly cookies)', async () => {
      // Since httpOnly cookies are not accessible via JavaScript,
      // getRefreshToken() always returns null in tests
      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
      }

      const mockResponse = { message: 'Password changed successfully' }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authService.changePassword(passwordData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', passwordData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const email = 'test@example.com'

      const mockResponse = { message: 'Reset email sent' }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authService.forgotPassword(email)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        token: 'reset-token',
        password: 'new-password',
      }

      const mockResponse = { message: 'Password reset successfully' }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authService.resetPassword(resetData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no cookie', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      })

      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })

    it('should return true when accessToken cookie exists', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'accessToken=some-token',
      })

      const result = authService.isAuthenticated()

      expect(result).toBe(true)
    })
  })
})
