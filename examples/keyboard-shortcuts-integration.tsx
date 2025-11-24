/**
 * Example Integration: Add to app/(dashboard)/layout.tsx
 * 
 * This shows how to integrate the keyboard shortcuts system into your app
 */

'use client'

import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enable global shortcuts
  useGlobalShortcuts()

  return (
    <div>
      {/* Your existing layout content */}
      {children}
      
      {/* Add keyboard shortcuts help button */}
      <KeyboardShortcutsHelp />
    </div>
  )
}
