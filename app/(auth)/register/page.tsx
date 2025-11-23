'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Lock, Mail, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react'
import { registerAction, type RegisterActionState } from '@/app/actions/auth'

// Botão submit separado para useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="primary"
      className="w-full py-3"
      disabled={pending}
    >
      {pending ? 'Creating account...' : 'Create Account'}
    </Button>
  )
}

const initialState: RegisterActionState = {
  error: null,
  details: null,
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [state, formAction] = useFormState(registerAction, initialState)
  const router = useRouter()

  const fieldErrors =
    state?.details &&
      typeof state.details === 'object' &&
      !Array.isArray(state.details)
      ? (state.details as Record<string, string>)
      : undefined

  // Handle successful registration redirect
  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[@$!%*?&]/.test(pwd)) strength++

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

    return {
      score: strength,
      label: labels[strength] || labels[0],
      color: colors[strength] || colors[0],
    }
  }

  const passwordStrength = password ? getPasswordStrength(password) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bank Dash
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create your account
            </p>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="John"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldErrors?.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {fieldErrors?.firstName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Doe"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldErrors?.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {fieldErrors?.lastName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldErrors?.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {fieldErrors?.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  pattern="^[+]?[\d()\s-]{6,20}$"
                  placeholder="+55 11 98765-4321"
                  title="Use apenas números, espaços, parênteses, hífens ou +"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldErrors?.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {fieldErrors?.phone && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${fieldErrors?.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className="text-xs font-medium">{passwordStrength.label}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {fieldErrors?.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${fieldErrors?.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <SubmitButton />
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
