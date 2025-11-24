'use client'

import { useI18n } from '@/i18n'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useKeyboardShortcuts, SHORTCUT_CATEGORIES, formatShortcut, type ShortcutCategory } from '@/hooks/useKeyboardShortcuts'
import { Keyboard } from 'lucide-react'

export function KeyboardShortcutsHelp() {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  // Register ? shortcut to open help
  useKeyboardShortcuts([
    {
      key: '?',
      shift: true,
      description: 'Show Keyboard Shortcuts',
      action: () => setIsOpen(true),
    },
  ])

  const categories: { key: ShortcutCategory; label: string }[] = [
    { key: 'navigation', label: t('keyboard.navigation') },
    { key: 'search', label: t('keyboard.search') },
    { key: 'actions', label: t('keyboard.actions') },
    { key: 'forms', label: t('keyboard.forms') },
  ]

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
        aria-label={t('keyboard.showShortcuts')}
        title={`${t('keyboard.shortcuts')} (Shift+?)`}
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('keyboard.shortcuts')}
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('keyboard.helpDescription')}
          </p>

          {categories.map(({ key, label }) => (
            <div key={key}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {label}
              </h3>
              <div className="space-y-2">
                {SHORTCUT_CATEGORIES[key].map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('common.press')} <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Shift</kbd> + <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">?</kbd> {t('keyboard.helpFooter')}
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
