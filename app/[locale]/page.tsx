'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

/**
 * Home Page - Redirect to Dashboard
 *
 * Using client-side redirect to avoid race conditions with React Query hydration
 * Server-side redirect() can cause "Cannot read properties of undefined (reading 'call')"
 * errors on first load when React Query tries to hydrate a component that's being redirected
 */
export default function HomePage() {
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    // Client-side redirect is safer with React Query
    router.replace(`/${locale}/dashboard`)
  }, [locale, router])

  // Show nothing while redirecting
  return null
}
