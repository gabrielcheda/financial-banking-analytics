// app/(auth)/login/page.tsx
'use client'

import { useI18n } from '@/i18n'
import { useState, useEffect, Suspense } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'BankDash'

// Componente separado para o botão submit (necessário para useFormStatus)
function SubmitButton() {
  const { t } = useI18n()
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="primary"
      className="w-full py-3"
      disabled={pending}
    >
      {pending ? t('auth.signingIn') : t('auth.signIn')}
    </Button>
  )
}

// Componente que usa useSearchParams precisa estar dentro de Suspense
function SuccessMessages() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const verified = searchParams.get('verified')
  const redirect = searchParams.get('redirect')

  return (
    <>
      {redirect && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t('auth.sessionExpired')}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t('auth.sessionExpiredMessage')}
            </p>
          </div>
        </div>
      )}
      {registered && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('auth.registrationSuccessTitle')}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t('auth.registrationSuccessMessage')}
            </p>
          </div>
        </div>
      )}
      {verified && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('auth.emailVerified')}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t('auth.emailVerifiedMessage')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function LoginForm() {
  const { t } = useI18n()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMeChecked, setRememberMeChecked] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [state, formAction] = useFormState(loginAction, { error: '' })
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const router = useRouter()

  // Traduz a mensagem de erro se for uma chave i18n (começa com 'errors.')
  const errorMessage = state?.error && state.error.startsWith('errors.')
    ? t(state.error)
    : state?.error

  // Handle successful login redirect
  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      setIsRedirecting(true)
      window.localStorage.setItem("accessToken", state?.tokens?.accessToken);
      window.localStorage.setItem("refreshToken", state?.tokens?.refreshToken);
      router.push(state.redirectTo)
    }

  }, [state, router])

  useEffect(() => {
    if (typeof document === 'undefined') return
    setRememberMeChecked(document.cookie.includes('rememberMe=true'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Loading Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {t('auth.redirecting')}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {t('auth.appTagline')}
            </p>
          </div>

          {/* Success Messages */}
          <Suspense fallback={null}>
            <SuccessMessages />
          </Suspense>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-6">
            {/* Hidden redirect field */}
            {redirect && <input type="hidden" name="redirect" value={redirect} />}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t('auth.enterEmail')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder={t('auth.enterPassword')}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMeChecked}
                  onChange={(e) => setRememberMeChecked(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.rememberMe')}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <SubmitButton />
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-white">{t('auth.loading')}</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  )
}
