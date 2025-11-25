/**
 * Tests for KeyboardShortcutsHelp Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'

// Mock dependencies
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
  SHORTCUT_CATEGORIES: {
    navigation: [],
    search: [],
    actions: [],
    forms: [],
  },
  formatShortcut: () => 'Ctrl+K',
}))

describe('KeyboardShortcutsHelp', () => {
  it('should render floating button', () => {
    render(<KeyboardShortcutsHelp />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should have keyboard icon', () => {
    const { container } = render(<KeyboardShortcutsHelp />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should have aria-label', () => {
    render(<KeyboardShortcutsHelp />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('should be fixed positioned', () => {
    const { container } = render(<KeyboardShortcutsHelp />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed')
  })
})
