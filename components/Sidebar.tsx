'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  FileText,
  Target,
  Menu,
  X,
  Wallet,
  PiggyBank,
  Receipt,
  Flag,
  Bell,
  Settings,
  Tag,
  Store
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePrefetch } from '@/hooks/usePrefetch'
import { useProfile } from '@/hooks/useUser'
import { useLogout } from '@/hooks/useAuth'

const navigation = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'accounts', href: '/accounts', icon: Wallet },
  { key: 'transactions', href: '/transactions', icon: ArrowLeftRight },
  { key: 'categories', href: '/categories', icon: Tag },
  { key: 'merchants', href: '/merchants', icon: Store },
  { key: 'budgets', href: '/budgets', icon: PiggyBank },
  { key: 'bills', href: '/bills', icon: Receipt },
  { key: 'goals', href: '/goals', icon: Flag },
  { key: 'analytics', href: '/analytics', icon: TrendingUp },
  { key: 'reports', href: '/reports', icon: FileText },
  { key: 'planning', href: '/planning', icon: Target },
  { key: 'notifications', href: '/notifications', icon: Bell },
  { key: 'settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  const tNav = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const { data: profile } = useProfile()
  const logout = useLogout()
  const {
    prefetchDashboardData,
    prefetchAccountsPage,
    prefetchTransactionsPage,
    prefetchCategoriesPage,
    prefetchMerchantsPage,
    prefetchBudgetsPage,
    prefetchBillsPage,
    prefetchGoalsPage,
    prefetchAnalyticsPage,
    prefetchReportsPage,
    prefetchPlanningPage,
  } = usePrefetch()

  const prefetchedRoutesRef = useRef<Set<string>>(new Set())
  const prefetchTimeoutsRef = useRef<Record<string, number>>({})

  const executePrefetch = (href: string) => {
    switch (href) {
      case '/dashboard':
        prefetchDashboardData()
        break
      case '/accounts':
        prefetchAccountsPage()
        break
      case '/transactions':
        prefetchTransactionsPage()
        break
      case '/categories':
        prefetchCategoriesPage()
        break
      case '/merchants':
        prefetchMerchantsPage()
        break
      case '/budgets':
        prefetchBudgetsPage()
        break
      case '/bills':
        prefetchBillsPage()
        break
      case '/goals':
        prefetchGoalsPage()
        break
      case '/analytics':
        prefetchAnalyticsPage()
        break
      case '/reports':
        prefetchReportsPage()
        break
      case '/planning':
        prefetchPlanningPage()
        break
    }
  }

  const schedulePrefetch = (href: string) => {
    if (prefetchedRoutesRef.current.has(href)) return

    if (typeof window === 'undefined') {
      executePrefetch(href)
      prefetchedRoutesRef.current.add(href)
      return
    }

    if (prefetchTimeoutsRef.current[href]) return

    prefetchTimeoutsRef.current[href] = window.setTimeout(() => {
      executePrefetch(href)
      prefetchedRoutesRef.current.add(href)
      delete prefetchTimeoutsRef.current[href]
    }, 250)
  }

  const cancelScheduledPrefetch = (href: string) => {
    const timeoutId = prefetchTimeoutsRef.current[href]
    if (timeoutId) {
      clearTimeout(timeoutId)
      delete prefetchTimeoutsRef.current[href]
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      Object.values(prefetchTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [])

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'
    : '...'

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="sidebar-navigation"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
        ) : (
          <Menu className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {tCommon('appName')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tCommon('tagline')}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              const label = tNav(item.key)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={() => schedulePrefetch(item.href)}
                  onFocus={() => schedulePrefetch(item.href)}
                  onMouseLeave={() => cancelScheduledPrefetch(item.href)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${label}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold uppercase">
                {initials}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  {profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.email : tCommon('loading')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {profile?.email || tCommon('loading')}
                </p>
              </div>
            </button>
            {isProfileMenuOpen && (
              <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    logout.mutate()
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                  disabled={logout.isPending}
                >
                  {tProfile('logout')}
                  {logout.isPending && <span className="text-xs text-gray-400">{tCommon('loading')}</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
