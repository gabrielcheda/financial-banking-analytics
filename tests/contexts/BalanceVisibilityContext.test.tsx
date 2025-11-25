import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceVisibilityProvider, useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'

// Mock dependencies
vi.mock('@/hooks/useUser', () => ({
  useProfile: () => ({
    data: {
      preferences: {
        privacy: {
          showBalance: true,
        },
      },
    },
    isLoading: false,
  }),
  useUpdatePreferences: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/useErrorTranslation', () => ({
  useErrorTranslation: () => ({
    translateError: (msg: string) => msg,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe('BalanceVisibilityContext', () => {
  it('should provide balance visibility context to children', () => {
    const TestComponent = () => {
      const { shouldShowBalance } = useBalanceVisibility()
      return <div>{shouldShowBalance ? 'Visible' : 'Hidden'}</div>
    }

    render(
      <BalanceVisibilityProvider>
        <TestComponent />
      </BalanceVisibilityProvider>
    )

    expect(screen.getByText('Visible')).toBeInTheDocument()
  })

  it('should provide isLoading state', () => {
    const TestComponent = () => {
      const { isLoading } = useBalanceVisibility()
      return <div>Loading: {isLoading ? 'true' : 'false'}</div>
    }

    render(
      <BalanceVisibilityProvider>
        <TestComponent />
      </BalanceVisibilityProvider>
    )

    expect(screen.getByText('Loading: false')).toBeInTheDocument()
  })

  it('should provide toggleBalanceVisibility function', () => {
    const TestComponent = () => {
      const { toggleBalanceVisibility } = useBalanceVisibility()
      return <button onClick={toggleBalanceVisibility}>Toggle</button>
    }

    render(
      <BalanceVisibilityProvider>
        <TestComponent />
      </BalanceVisibilityProvider>
    )

    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument()
  })

  it('should provide isToggling state', () => {
    const TestComponent = () => {
      const { isToggling } = useBalanceVisibility()
      return <div>Toggling: {isToggling ? 'true' : 'false'}</div>
    }

    render(
      <BalanceVisibilityProvider>
        <TestComponent />
      </BalanceVisibilityProvider>
    )

    expect(screen.getByText('Toggling: false')).toBeInTheDocument()
  })

  it('should throw error when useBalanceVisibility is used outside provider', () => {
    const TestComponent = () => {
      useBalanceVisibility()
      return <div>Test</div>
    }

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useBalanceVisibility must be used within BalanceVisibilityProvider'
    )

    consoleError.mockRestore()
  })
})
