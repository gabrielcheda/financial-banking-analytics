import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/api/user.service'
import authService from '@/services/api/auth.service'
import type {
  UpdateProfileDTO,
  UpdatePreferencesDTO,
  ChangePasswordDTO,
} from '@/types/dto'

/**
 * Get current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

/**
 * Get user preferences
 */
export function usePreferences() {
  return useQuery({
    queryKey: ['user', 'preferences'],
    queryFn: () => userService.getPreferences(),
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePreferencesDTO) => userService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'preferences'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDTO) =>
      authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
  })
}

/**
 * Upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (base64Image: string) => userService.uploadAvatar(base64Image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

/**
 * Delete account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) => userService.deleteAccount(password),
    onSuccess: () => {
      queryClient.clear()
      // Redirect to login will be handled by the component
    },
  })
}
