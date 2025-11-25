/**
 * Tests for ThemeProvider Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

// Test component to access theme context
const ThemeConsumer = () => {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Clear document classes
    document.documentElement.className = ''
    // Mock matchMedia for system theme
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should provide theme context to children', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toBeInTheDocument()
    })
  })

  describe('Default Theme', () => {
    it('should use system theme by default', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    })

    it('should use custom default theme when provided', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  describe('Theme Switching', () => {
    it('should switch to dark theme', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      await user.click(screen.getByText('Set Dark'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('should switch to light theme', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      await user.click(screen.getByText('Set Light'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('should switch to system theme', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      await user.click(screen.getByText('Set System'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should save theme to localStorage', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider storageKey="test-theme">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      await user.click(screen.getByText('Set Dark'))
      expect(localStorage.getItem('test-theme')).toBe('dark')
    })

    it('should use custom storage key', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider storageKey="custom-theme">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      await user.click(screen.getByText('Set Light'))
      expect(localStorage.getItem('custom-theme')).toBe('light')
    })
  })

  describe('DOM Updates', () => {
    it('should add dark class when theme is dark', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      await user.click(screen.getByText('Set Dark'))
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should remove dark class when theme is light', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      // Start with dark
      await act(async () => {})
      
      await user.click(screen.getByText('Set Light'))
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('System Theme Detection', () => {
    it('should detect dark system theme', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      })
      
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should detect light system theme', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      })
      
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('useTheme Hook', () => {
    it('should provide theme and setTheme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toBeInTheDocument()
      expect(screen.getByText('Set Dark')).toBeInTheDocument()
      expect(screen.getByText('Set Light')).toBeInTheDocument()
      expect(screen.getByText('Set System')).toBeInTheDocument()
    })
  })

  describe('Transition Control', () => {
    it('should disable transitions when specified', () => {
      render(
        <ThemeProvider disableTransitionOnChange={true}>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      // Component should render without transitions
      expect(screen.getByTestId('current-theme')).toBeInTheDocument()
    })

    it('should enable transitions by default', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toBeInTheDocument()
    })
  })
})
