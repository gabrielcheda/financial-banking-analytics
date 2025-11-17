/**
 * Auth Hooks
 *
 * React Query hooks for authentication
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import authService from '@/services/api/auth.service'
import type { LoginDTO, RegisterDTO } from '@/types/dto'
import { showErrorToast, getErrorMessages, isValidationError } from '@/lib/error-utils'

/**
 * Hook for login
 */
export function useLogin() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginDTO) => authService.login(data),
    onSuccess: (response) => {
      // Store user data in query cache
      queryClient.setQueryData(['user'], response.user)

      toast.success(t('signIn'))
      router.push(`/${locale}/dashboard`)
    },
    onError: (error) => {
      showErrorToast(error, 'Login Failed')
    },
  })
}

/**
 * Hook for registration
 */
export function useRegister() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RegisterDTO) => await authService.register(data),
    onSuccess: (response) => {
      console.log("Register Response", response);
      // Store user data in query cache
      queryClient.setQueryData(['user'], response.user)

      toast.success(t('signUp'))
      router.push(`/${locale}/dashboard`)
    },
    onError: (error) => {
      // Erros de validação mostram todas as mensagens
      if (isValidationError(error)) {
        const messages = getErrorMessages(error)
        showErrorToast(error, messages.join(', '))
      } else {
        showErrorToast(error, 'Registration Failed')
      }
    },
  })
}

/**
 * Hook for logout
 */
export function useLogout() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('profile')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()

      toast.success(t('logout'))
      router.push(`/${locale}/login`)
    },
    onError: (error: any) => {
      // Still logout locally even if server request fails
      queryClient.clear()
      router.push(`/${locale}/login`)
    },
  })
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Change Password')
    },
  })
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset link sent to your email')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Send Reset Link')
    },
  })
}

/**
 * Hook for reset password
 */
export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      authService.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully')
      router.push('/login')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to Reset Password')
    },
  })
}
