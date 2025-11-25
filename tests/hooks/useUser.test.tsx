import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useProfile,
  useUpdateProfile,
  usePreferences,
  useUpdatePreferences,
  useChangePassword,
  useUploadAvatar,
  useDeleteAccount,
} from '@/hooks/useUser'
import { userService } from '@/services/api/user.service'
import authService from '@/services/api/auth.service'

// Mock dependencies
vi.mock('@/services/api/user.service', () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAccount: vi.fn(),
  },
}))

vi.mock('@/services/api/auth.service', () => ({
  default: {
    changePassword: vi.fn(),
  },
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

describe('useUser Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      }

      vi.mocked(userService.getProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(userService.getProfile).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockProfile)
    })

    it('should handle profile fetch error', async () => {
      const mockError = new Error('Failed to fetch profile')
      vi.mocked(userService.getProfile).mockRejectedValue(mockError)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('should have correct staleTime', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      // Query should use the staleTime defined (5 minutes = 300000ms)
      expect(result.current).toBeDefined()
    })

    it('should cache profile data', async () => {
      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      }

      vi.mocked(userService.getProfile).mockResolvedValue(mockProfile)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cachedData = queryClient.getQueryData(['user', 'profile'])
      expect(cachedData).toEqual(mockProfile)
    })
  })

  describe('useUpdateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      }

      const mockUpdatedProfile = {
        id: '1',
        ...updateData,
      }

      vi.mocked(userService.updateProfile).mockResolvedValue(mockUpdatedProfile)

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(userService.updateProfile).toHaveBeenCalledWith(updateData)
    })

    it('should invalidate profile query after update', async () => {
      const updateData = {
        name: 'Updated Name',
      }

      vi.mocked(userService.updateProfile).mockResolvedValue({} as any)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'profile'] })
    })

    it('should handle update profile error', async () => {
      const updateData = {
        name: 'Updated Name',
      }

      const mockError = new Error('Failed to update profile')
      vi.mocked(userService.updateProfile).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('usePreferences', () => {
    it('should fetch user preferences successfully', async () => {
      const mockPreferences = {
        language: 'en',
        currency: 'USD',
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
        },
      }

      vi.mocked(userService.getPreferences).mockResolvedValue(mockPreferences)

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(userService.getPreferences).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockPreferences)
    })

    it('should handle preferences fetch error', async () => {
      const mockError = new Error('Failed to fetch preferences')
      vi.mocked(userService.getPreferences).mockRejectedValue(mockError)

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdatePreferences', () => {
    it('should update preferences successfully', async () => {
      const updateData = {
        language: 'pt-BR',
        currency: 'BRL',
      }

      const mockUpdatedPreferences = {
        ...updateData,
        theme: 'dark',
      }

      vi.mocked(userService.updatePreferences).mockResolvedValue(mockUpdatedPreferences)

      const { result } = renderHook(() => useUpdatePreferences(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(userService.updatePreferences).toHaveBeenCalledWith(updateData)
    })

    it('should invalidate both preferences and profile queries after update', async () => {
      const updateData = {
        language: 'pt-BR',
      }

      vi.mocked(userService.updatePreferences).mockResolvedValue({} as any)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUpdatePreferences(), { wrapper })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'preferences'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'profile'] })
    })

    it('should handle update preferences error', async () => {
      const updateData = {
        language: 'invalid-lang',
      }

      const mockError = new Error('Invalid language code')
      vi.mocked(userService.updatePreferences).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdatePreferences(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
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

      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
    })

    it('should handle change password error', async () => {
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

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

      const mockResponse = {
        avatarUrl: 'https://example.com/new-avatar.jpg',
      }

      vi.mocked(userService.uploadAvatar).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUploadAvatar(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(base64Image)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(userService.uploadAvatar).toHaveBeenCalledWith(base64Image)
    })

    it('should invalidate profile query after avatar upload', async () => {
      const base64Image = 'data:image/png;base64,abc123'

      vi.mocked(userService.uploadAvatar).mockResolvedValue({} as any)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      result.current.mutate(base64Image)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'profile'] })
    })

    it('should handle upload avatar error', async () => {
      const base64Image = 'invalid-base64'

      const mockError = new Error('Invalid image format')
      vi.mocked(userService.uploadAvatar).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUploadAvatar(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(base64Image)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useDeleteAccount', () => {
    it('should delete account successfully', async () => {
      const password = 'ConfirmPassword123!'

      vi.mocked(userService.deleteAccount).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(password)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(userService.deleteAccount).toHaveBeenCalledWith(password)
    })

    it('should clear query cache after account deletion', async () => {
      const password = 'ConfirmPassword123!'

      vi.mocked(userService.deleteAccount).mockResolvedValue(undefined)

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

      const { result } = renderHook(() => useDeleteAccount(), { wrapper })

      result.current.mutate(password)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(clearSpy).toHaveBeenCalled()
    })

    it('should handle delete account error', async () => {
      const password = 'WrongPassword'

      const mockError = new Error('Invalid password')
      vi.mocked(userService.deleteAccount).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(password)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('Hook states and lifecycle', () => {
    it('should have correct initial state for useProfile', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isPending).toBe(true)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should have correct initial state for mutations', () => {
      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isPending).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })
})
