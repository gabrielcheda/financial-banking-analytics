'use client'

import { useState, useEffect, useRef } from 'react'
import { Moon, Sun, Search, Bell, X, Eye, EyeOff } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useI18n } from '@/i18n'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchTransactions } from '@/hooks/useTransactions'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/utils/currency'
import { formatSmartDate } from '@/utils/date'
import { useUnreadCount, useNotifications, useMarkAsRead } from '@/hooks/useNotifications'
import Link from 'next/link'
import { format } from 'date-fns'
import type { TransactionDTO } from '@/types/dto'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'
import { BalanceDisplay } from './BalanceDisplay'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const { shouldShowBalance, toggleBalanceVisibility, isToggling } = useBalanceVisibility()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { data: searchResults, isLoading } = useSearchTransactions(debouncedSearch)
  const { data: unreadCount } = useUnreadCount()
  const { data: notificationsData } = useNotifications({ unreadOnly: false, limit: 5 })
  const markAsRead = useMarkAsRead()

  const notifications = notificationsData?.data || []
  const hasUnread = typeof unreadCount === 'number' && unreadCount > 0
  const unreadBadgeText = hasUnread ? (unreadCount > 9 ? '9+' : unreadCount.toString()) : null
  const notificationsLabel = hasUnread
    ? `Notifications, ${unreadCount > 9 ? '9 or more' : unreadCount} unread`
    : 'Notifications'

  // Helper to translate smart dates (returns translation key or formatted date)
  const translateSmartDate = (date: Date | string): string => {
    const result = formatSmartDate(date)
    // If it's a translation key (starts with 'common.'), translate it
    if (result.startsWith('common.')) {
      return t(result as any)
    }
    // Otherwise it's already formatted (day name or date)
    return result
  }

  // Close search and notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (transactionId: string) => {
    router.push(`/transactions?id=${transactionId}`)
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Desktop Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t('transactions.searchTransactions')}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearchOpen(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {isSearchOpen && debouncedSearch.length >= 3 && (
                <div className="absolute top-full mt-2 w-full max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      {t('search.searching')}
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((transaction: TransactionDTO) => (
                        <button
                          key={transaction.id}
                          onClick={() => handleResultClick(transaction.id)}
                          className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {translateSmartDate(transaction.date)}
                              </p>
                            </div>
                            <p className={`text-sm font-semibold ${
                              transaction.type === 'income'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              <BalanceDisplay amount={Math.abs(transaction.amount)} showSign={false} />
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            router.push(`/transactions?search=${searchQuery}`)
                            setIsSearchOpen(false)
                          }}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t('search.viewAll', { count: searchResults.length })}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {t('common.noResults')}
                    </div>
                  )}
                </div>
              )}

              {isSearchOpen && debouncedSearch.length > 0 && debouncedSearch.length < 3 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 text-sm">
                  {t('search.minCharacters') || 'Type at least 3 characters to search'}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={t('common.search')}
            >
              {isMobileSearchOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="sm:hidden">
              <LanguageSwitcher compact />
            </div>
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={notificationsLabel}
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {hasUnread && (
                  <span
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
                    aria-hidden="true"
                  >
                    {unreadBadgeText}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="fixed sm:absolute right-2 sm:right-0 mt-2 w-[calc(100vw-1rem)] max-w-[380px] sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('notifications.title')}
                    </h3>
                    {unreadCount && unreadCount > 0 && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                        {unreadCount} {t('notifications.new') || 'new'}
                      </span>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('notifications.noNotifications')}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead.mutate(notification.id)
                              }
                              if (notification.actionUrl) {
                                router.push(notification.actionUrl)
                              }
                              setIsNotificationsOpen(false)
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {t('notifications.viewAll') || 'View all notifications'} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Balance Visibility Toggle */}
            <button
              onClick={toggleBalanceVisibility}
              disabled={isToggling}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={shouldShowBalance ? t('settings.hideBalance') || 'Hide balances' : t('settings.showBalance') || 'Show balances'}
              title={shouldShowBalance ? t('settings.hideBalance') || 'Hide balances' : t('settings.showBalance') || 'Show balances'}
            >
              {shouldShowBalance ? (
                <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={t('settings.toggleTheme') || 'Toggle theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Expandable) */}
        {isMobileSearchOpen && (
          <div className="md:hidden mt-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t('transactions.searchTransactions')}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearchOpen(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Search Results */}
              {isSearchOpen && debouncedSearch.length >= 3 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      {t('search.searching')}
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.map((result: TransactionDTO) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.id)}
                          className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                {result.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {result.merchant} • {translateSmartDate(result.date)}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-semibold text-sm ${
                                result.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                              }`}>
                                <BalanceDisplay amount={result.amount} showSign={true} />
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {t('empty.noTransactions')}
                    </div>
                  )}
                </div>
              )}

              {!isSearchOpen && searchQuery.length < 3 && searchQuery.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 text-sm">
                  {t('search.minCharacters') || 'Type at least 3 characters to search'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
