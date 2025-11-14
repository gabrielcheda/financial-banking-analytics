'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { useState } from 'react'
import { usePrefetch } from '@/hooks/usePrefetch'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Merchants', href: '/merchants', icon: Store },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
  { name: 'Bills', href: '/bills', icon: Receipt },
  { name: 'Goals', href: '/goals', icon: Flag },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Planning', href: '/planning', icon: Target },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const handlePrefetch = (href: string) => {
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
              BankDash
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Financial Analytics
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={() => handlePrefetch(item.href)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.name}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  John Doe
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  john@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
