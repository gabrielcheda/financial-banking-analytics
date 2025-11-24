/**
 * Keyboard Shortcuts Hook
 * 
 * Centralized keyboard shortcut management with customizable key bindings
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean // Command on Mac, Windows key on Windows
  description: string
  action: () => void
}

export type ShortcutCategory = 'navigation' | 'actions' | 'search' | 'forms'

/**
 * Check if keyboard event matches shortcut definition
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey)
  const altMatch = !!shortcut.alt === event.altKey
  const shiftMatch = !!shortcut.shift === event.shiftKey

  return keyMatch && ctrlMatch && altMatch && shiftMatch
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      const isContentEditable = target.isContentEditable

      if (isInput || isContentEditable) {
        // Only allow Escape and certain Ctrl/Cmd shortcuts in inputs
        if (event.key !== 'Escape' && !event.ctrlKey && !event.metaKey) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

/**
 * Global keyboard shortcuts for the application
 */
export function useGlobalShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'd',
      ctrl: true,
      description: 'Go to Dashboard',
      action: () => router.push('/dashboard'),
    },
    {
      key: 't',
      ctrl: true,
      description: 'Go to Transactions',
      action: () => router.push('/transactions'),
    },
    {
      key: 'b',
      ctrl: true,
      description: 'Go to Budgets',
      action: () => router.push('/budgets'),
    },
    {
      key: 'g',
      ctrl: true,
      description: 'Go to Goals',
      action: () => router.push('/goals'),
    },
    {
      key: 'a',
      ctrl: true,
      description: 'Go to Analytics',
      action: () => router.push('/analytics'),
    },

    // Search
    {
      key: 'k',
      ctrl: true,
      description: 'Open Search',
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        searchInput?.focus()
      },
    },
    {
      key: '/',
      description: 'Focus Search',
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        searchInput?.focus()
      },
    },

    // Actions
    {
      key: 'n',
      ctrl: true,
      description: 'New Transaction',
      action: () => {
        const newButton = document.querySelector('[data-action="new-transaction"]') as HTMLButtonElement
        newButton?.click()
      },
    },
    {
      key: 'Escape',
      description: 'Close Modal/Cancel',
      action: () => {
        const closeButton = document.querySelector('[data-modal-close]') as HTMLButtonElement
        closeButton?.click()
      },
    },

    // Settings
    {
      key: ',',
      ctrl: true,
      description: 'Open Settings',
      action: () => router.push('/settings'),
    },
  ]

  useKeyboardShortcuts(shortcuts)
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  
  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl')
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt')
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift')
  
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join(isMac ? '' : '+')
}

/**
 * Keyboard shortcuts help modal content
 */
export const SHORTCUT_CATEGORIES: Record<ShortcutCategory, KeyboardShortcut[]> = {
  navigation: [
    { key: 'd', ctrl: true, description: 'Go to Dashboard', action: () => {} },
    { key: 't', ctrl: true, description: 'Go to Transactions', action: () => {} },
    { key: 'b', ctrl: true, description: 'Go to Budgets', action: () => {} },
    { key: 'g', ctrl: true, description: 'Go to Goals', action: () => {} },
    { key: 'a', ctrl: true, description: 'Go to Analytics', action: () => {} },
  ],
  search: [
    { key: 'k', ctrl: true, description: 'Open Search', action: () => {} },
    { key: '/', description: 'Focus Search', action: () => {} },
  ],
  actions: [
    { key: 'n', ctrl: true, description: 'New Transaction', action: () => {} },
    { key: 'Escape', description: 'Close Modal/Cancel', action: () => {} },
  ],
  forms: [
    { key: 'Enter', ctrl: true, description: 'Submit Form', action: () => {} },
    { key: 's', ctrl: true, description: 'Save', action: () => {} },
  ],
}
