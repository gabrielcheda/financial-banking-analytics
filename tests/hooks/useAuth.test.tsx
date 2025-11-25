import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  useLogin,
  useRegister,
  useLogout,
  useChangePassword,
  useForgotPassword,
  useResetPassword,
} from '@/hooks/useAuth'
import authService from '@/services/api/auth.service'
import * as errorUtils from '@/lib/error-utils'

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/services/api/auth.service', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/error-utils', () => ({
  showErrorToast: vi.fn(),
  getErrorMessages: vi.fn(),
  isValidationError: vi.fn(),
}))

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

describe('useAuth Hooks', () => {
  const mockPush = vi.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    
    // Clear localStorage
    window.localStorage.clear()
  })

  describe('useLogin', () => {
    it('should login successfully and redirect to dashboard', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      const mockResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(loginData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.login).toHaveBeenCalledWith(loginData)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle login error and show error toast', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password',
      }

      const mockError = new Error('Invalid credentials')
      vi.mocked(authService.login).mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(loginData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Login Failed')
    })

    it('should store user data in query cache on success', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      const mockResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useLogin(), { wrapper })

      result.current.mutate(loginData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cachedUser = queryClient.getQueryData(['user'])
      expect(cachedUser).toEqual(mockResponse.user)
    })
  })

  describe('useRegister', () => {
    it('should register successfully and redirect to dashboard', async () => {
      const registerData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }

      const mockResponse = {
        user: { id: '2', email: 'new@example.com', name: 'New User' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }

      vi.mocked(authService.register).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(registerData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.register).toHaveBeenCalledWith(registerData)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle validation errors and show all messages', async () => {
      const registerData = {
        name: 'New User',
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'weak',
      }

      const mockError = new Error('Validation failed')
      vi.mocked(authService.register).mockRejectedValue(mockError)
      vi.mocked(errorUtils.isValidationError).mockReturnValue(true)
      vi.mocked(errorUtils.getErrorMessages).mockReturnValue([
        'Invalid email format',
        'Password too weak',
      ])

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(registerData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.isValidationError).toHaveBeenCalledWith(mockError)
      expect(errorUtils.getErrorMessages).toHaveBeenCalledWith(mockError)
      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(
        mockError,
        'Invalid email format, Password too weak'
      )
    })

    it('should handle non-validation errors', async () => {
      const registerData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }

      const mockError = new Error('Server error')
      vi.mocked(authService.register).mockRejectedValue(mockError)
      vi.mocked(errorUtils.isValidationError).mockReturnValue(false)

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(registerData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Registration Failed')
    })
  })

  describe('useLogout', () => {
    it('should logout successfully and clear cache', async () => {
      // Set tokens in localStorage
      window.localStorage.setItem('accessToken', 'access-token')
      window.localStorage.setItem('refreshToken', 'refresh-token')

      vi.mocked(authService.logout).mockResolvedValue(undefined)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const clearSpy = vi.spyOn(queryClient, 'clear')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useLogout(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.logout).toHaveBeenCalled()
      expect(clearSpy).toHaveBeenCalled()
      expect(window.localStorage.getItem('accessToken')).toBeNull()
      expect(window.localStorage.getItem('refreshToken')).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should logout locally even if server request fails', async () => {
      window.localStorage.setItem('accessToken', 'access-token')
      window.localStorage.setItem('refreshToken', 'refresh-token')

      const mockError = new Error('Server error')
      vi.mocked(authService.logout).mockRejectedValue(mockError)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const clearSpy = vi.spyOn(queryClient, 'clear')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useLogout(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(clearSpy).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('useChangePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      }

      vi.mocked(authService.changePassword).mockResolvedValue(undefined)

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(passwordData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.changePassword).toHaveBeenCalledWith(passwordData)
    })

    it('should handle password change error', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123!',
      }

      const mockError = new Error('Current password is incorrect')
      vi.mocked(authService.changePassword).mockRejectedValue(mockError)

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(passwordData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(
        mockError,
        'Failed to Change Password'
      )
    })
  })

  describe('useForgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const email = 'user@example.com'

      vi.mocked(authService.forgotPassword).mockResolvedValue(undefined)

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(email)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.forgotPassword).toHaveBeenCalledWith(email)
    })

    it('should handle forgot password error', async () => {
      const email = 'nonexistent@example.com'

      const mockError = new Error('Email not found')
      vi.mocked(authService.forgotPassword).mockRejectedValue(mockError)

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(email)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(
        mockError,
        'Failed to Send Reset Link'
      )
    })
  })

  describe('useResetPassword', () => {
    it('should reset password successfully and redirect to login', async () => {
      const resetData = {
        token: 'reset-token',
        password: 'NewPassword123!',
      }

      vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(resetData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.resetPassword).toHaveBeenCalledWith(resetData)
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should handle reset password error', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'NewPassword123!',
      }

      const mockError = new Error('Invalid or expired token')
      vi.mocked(authService.resetPassword).mockRejectedValue(mockError)

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(resetData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(
        mockError,
        'Failed to Reset Password'
      )
    })
  })

  describe('Hook states', () => {
    it('should have correct initial state for useLogin', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isPending).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.data).toBeUndefined()
    })

    it('should transition to pending state during mutation', async () => {
      vi.mocked(authService.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ email: 'test@example.com', password: 'password' })

      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })
    })
  })
})
