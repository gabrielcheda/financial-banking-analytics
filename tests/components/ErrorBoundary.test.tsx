/**
 * Tests for ErrorBoundary Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Mock useI18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Component that throws error
const ThrowError = ({ error }: { error: string }) => {
  throw new Error(error)
}

// Component that renders successfully
const WorkingComponent = () => <div>Working Component</div>

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Working Component')).toBeInTheDocument()
    })

    it('should not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      )
      
      expect(screen.queryByText('errors.somethingWentWrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError error="Test error" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('errors.somethingWentWrong')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError error="Custom error message" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('should display error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError error="Test error" />
        </ErrorBoundary>
      )
      
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should display action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError error="Test error" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('common.tryAgain')).toBeInTheDocument()
      expect(screen.getByText('nav.goToDashboard')).toBeInTheDocument()
    })
  })
})
