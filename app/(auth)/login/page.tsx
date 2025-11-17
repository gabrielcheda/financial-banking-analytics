// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'BankDash'
const APP_TAGLINE = 'Financial intelligence for modern banking'

// Componente separado para o botão submit (necessário para useFormStatus)
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="primary"
      className="w-full py-3"
      disabled={pending}
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

// Componente que usa useSearchParams precisa estar dentro de Suspense
function SuccessMessages() {
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
              Session expired
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Your session has ended. Please sign in again to continue.
            </p>
          </div>
        </div>
      )}
      {registered && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Registration successful
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              You can now sign in with your new account.
            </p>
          </div>
        </div>
      )}
      {verified && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Email verified
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your email is confirmed. Please sign in to continue.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMeChecked, setRememberMeChecked] = useState(false)
  const [state, formAction] = useFormState(loginAction, { error: null })
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const router = useRouter()

  // Handle successful login redirect
  useEffect(() => {
    if (state?.success && state?.redirectTo) {
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
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {APP_TAGLINE}
            </p>
          </div>

          {/* Success Messages */}
          <Suspense fallback={null}>
            <SuccessMessages />
          </Suspense>

          {/* Error Message */}
          {state?.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-6">
            {/* Hidden redirect field */}
            {redirect && <input type="hidden" name="redirect" value={redirect} />}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
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
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <SubmitButton />
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-white">Loading...</div>
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
