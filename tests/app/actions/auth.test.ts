import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginAction, registerAction, logoutAction } from '@/app/actions/auth'

// Mock next/headers
const mockCookies = {
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: () => mockCookies,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Auth Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginAction', () => {
    it('should return success with tokens on valid credentials', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        }),
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('rememberMe', 'off')

      const result = await loginAction(null, formData)

      expect(result.success).toBe(true)
      expect(result.redirectTo).toBe('/dashboard')
      expect(mockCookies.set).toHaveBeenCalledWith('accessToken', 'mock-access-token', expect.any(Object))
    })

    it('should return error on invalid credentials', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          success: false,
          message: 'Invalid credentials',
        }),
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrong')

      const result = await loginAction(null, formData)

      expect(result.error).toBeTruthy()
      expect(mockCookies.set).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      const result = await loginAction(null, formData)

      expect(result.error).toBeTruthy()
    })

    it('should use custom redirect URL when provided', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        }),
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('redirect', '/accounts')

      const result = await loginAction(null, formData)

      expect(result.redirectTo).toBe('/accounts')
    })
  })

  describe('registerAction', () => {
    it('should return success on valid registration', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        }),
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')
      formData.append('phone', '')

      const result = await registerAction({}, formData)

      expect(result.success).toBe(true)
      expect(result.redirectTo).toBe('/dashboard')
      expect(mockCookies.set).toHaveBeenCalled()
    })

    it('should return error when passwords do not match', async () => {
      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'different')
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')

      const result = await registerAction({}, formData)

      expect(result.error).toBe('errors.validation.passwordsDoNotMatch')
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should return error on invalid phone number', async () => {
      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')
      formData.append('phone', 'invalid')

      const result = await registerAction({}, formData)

      expect(result.error).toBe('errors.validation.invalidPhoneNumber')
    })

    it('should handle registration failure from server', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          success: false,
          message: 'Email already exists',
        }),
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const formData = new FormData()
      formData.append('email', 'existing@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')
      formData.append('phone', '')

      const result = await registerAction({}, formData)

      expect(result.error).toBeTruthy()
    })

    it('should handle network errors during registration', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')
      formData.append('phone', '')

      const result = await registerAction({}, formData)

      expect(result.error).toBeTruthy()
    })
  })

  describe('logoutAction', () => {
    it('should delete all auth cookies', async () => {
      const { redirect } = await import('next/navigation')
      
      try {
        await logoutAction()
      } catch (e) {
        // redirect throws, which is expected
      }

      expect(mockCookies.delete).toHaveBeenCalledWith('accessToken')
      expect(mockCookies.delete).toHaveBeenCalledWith('accessTokenPublic')
      expect(mockCookies.delete).toHaveBeenCalledWith('refreshToken')
      expect(mockCookies.delete).toHaveBeenCalledWith('rememberMe')
      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })
})
