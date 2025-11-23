'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { useForgotPassword } from '@/hooks/useAuth'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'BankDash'

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const forgotPassword = useForgotPassword()
  const isSubmitting = forgotPassword.isPending
  const requestError =
    forgotPassword.error instanceof Error ? forgotPassword.error.message : undefined

  const onSubmit = async (values: ForgotPasswordInput) => {
    forgotPassword.reset()
    try {
      await forgotPassword.mutateAsync(values.email)
      setSubmittedEmail(values.email)
    } catch {
      // Toast feedback handled inside hook
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <Link href="/login" className="hover:underline">
              Back to sign in
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Enter your email below and we&apos;ll send you instructions to reset your password for{' '}
              {APP_NAME}.
            </p>
          </div>

          {submittedEmail && !requestError && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Check your email
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  We sent reset instructions to <strong>{submittedEmail}</strong>. Follow the steps to
                  choose a new password.
                </p>
              </div>
            </div>
          )}

          {requestError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{requestError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending reset link...' : 'Send reset instructions'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
