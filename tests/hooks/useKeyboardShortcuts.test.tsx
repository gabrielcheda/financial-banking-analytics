import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts, formatShortcut, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let mockAction: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockAction = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should trigger shortcut on matching key press', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should not trigger shortcut when disabled', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts, false))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should handle multiple shortcuts', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()

      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: action1 },
        { key: 'o', ctrl: true, description: 'Open', action: action2 },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const saveEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(saveEvent)

      const openEvent = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true })
      document.dispatchEvent(openEvent)

      expect(action1).toHaveBeenCalledTimes(1)
      expect(action2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Modifier Keys', () => {
    it('should handle Ctrl modifier', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle Alt modifier', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', alt: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', altKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle Shift modifier', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', shift: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', shiftKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle Meta/Cmd modifier', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple modifiers', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, shift: true, description: 'Save As', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should not trigger if modifier is missing', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's' })
      document.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should not trigger if extra modifier is pressed', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, altKey: true })
      document.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()
    })
  })

  describe('Input Element Handling', () => {
    it('should not trigger shortcuts in input fields', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', description: 'Search', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', { key: 's', bubbles: true })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })
      input.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should not trigger shortcuts in textarea', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', description: 'Search', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      const event = new KeyboardEvent('keydown', { key: 's', bubbles: true })
      Object.defineProperty(event, 'target', { value: textarea, enumerable: true })
      textarea.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should not trigger shortcuts in select', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', description: 'Search', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const select = document.createElement('select')
      document.body.appendChild(select)

      const event = new KeyboardEvent('keydown', { key: 's', bubbles: true })
      Object.defineProperty(event, 'target', { value: select, enumerable: true })
      select.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()

      document.body.removeChild(select)
    })

    it('should allow Escape in input fields', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'Escape', description: 'Close', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })
      input.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('should allow Ctrl shortcuts in input fields', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })
      input.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })
  })

  describe('Event Handling', () => {
    it('should prevent default on shortcut trigger', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should stop propagation on shortcut trigger', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      document.dispatchEvent(event)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should only trigger first matching shortcut', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()

      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: action1 },
        { key: 's', ctrl: true, description: 'Save Copy', action: action2 },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(action1).toHaveBeenCalledTimes(1)
      expect(action2).not.toHaveBeenCalled()
    })
  })

  describe('Case Sensitivity', () => {
    it('should handle lowercase keys', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle uppercase keys', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'S', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 'S', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should match case insensitively', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = new KeyboardEvent('keydown', { key: 'S', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction },
      ]

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts))

      unmount()

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should update listeners when shortcuts change', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        {
          initialProps: {
            shortcuts: [{ key: 's', ctrl: true, description: 'Save', action: action1 }],
          },
        }
      )

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      document.dispatchEvent(event)

      expect(action1).toHaveBeenCalledTimes(1)
      expect(action2).not.toHaveBeenCalled()

      // Update shortcuts
      rerender({
        shortcuts: [{ key: 's', ctrl: true, description: 'Save', action: action2 }],
      })

      vi.clearAllMocks()

      document.dispatchEvent(event)

      expect(action1).not.toHaveBeenCalled()
      expect(action2).toHaveBeenCalledTimes(1)
    })
  })
})

describe('formatShortcut', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    })
  })

  it('should format shortcut with Ctrl on Windows', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      configurable: true,
      writable: true,
    })

    const shortcut: KeyboardShortcut = {
      key: 's',
      ctrl: true,
      description: 'Save',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Ctrl+S')
  })

  it('should format shortcut with Cmd on Mac', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'MacIntel' },
      configurable: true,
      writable: true,
    })

    const shortcut: KeyboardShortcut = {
      key: 's',
      ctrl: true,
      description: 'Save',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('⌘S')
  })

  it('should format shortcut with multiple modifiers on Windows', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      configurable: true,
      writable: true,
    })

    const shortcut: KeyboardShortcut = {
      key: 's',
      ctrl: true,
      shift: true,
      description: 'Save As',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Ctrl+Shift+S')
  })

  it('should format shortcut with Alt modifier', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      configurable: true,
      writable: true,
    })

    const shortcut: KeyboardShortcut = {
      key: 'f',
      alt: true,
      description: 'File Menu',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Alt+F')
  })

  it('should format simple key without modifiers', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      configurable: true,
      writable: true,
    })

    const shortcut: KeyboardShortcut = {
      key: 'Escape',
      description: 'Cancel',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('ESCAPE')
  })

  it('should uppercase the key', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      configurable: true,
      writable: true,
    })

    const shortcut: KeyboardShortcut = {
      key: 'a',
      ctrl: true,
      description: 'Select All',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Ctrl+A')
  })
})
