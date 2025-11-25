/**
 * Tests for FormErrorBoundary Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'

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
const WorkingForm = () => <form>Working Form</form>

describe('FormErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <FormErrorBoundary>
          <WorkingForm />
        </FormErrorBoundary>
      )
      
      expect(screen.getByText('Working Form')).toBeInTheDocument()
    })

    it('should not show error UI when children render successfully', () => {
      render(
        <FormErrorBoundary>
          <WorkingForm />
        </FormErrorBoundary>
      )
      
      expect(screen.queryByText('common.formError')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <FormErrorBoundary>
          <ThrowError error="Form validation error" />
        </FormErrorBoundary>
      )
      
      expect(screen.getByText('common.formError')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <FormErrorBoundary>
          <ThrowError error="Test error message" />
        </FormErrorBoundary>
      )
      
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should display retry button', () => {
      render(
        <FormErrorBoundary>
          <ThrowError error="Test error" />
        </FormErrorBoundary>
      )
      
      expect(screen.getByText('common.tryAgain')).toBeInTheDocument()
    })

    it('should display alert icon', () => {
      render(
        <FormErrorBoundary>
          <ThrowError error="Test error" />
        </FormErrorBoundary>
      )
      
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = () => <div>Custom Error Message</div>
      
      render(
        <FormErrorBoundary fallback={<CustomFallback />}>
          <ThrowError error="Test error" />
        </FormErrorBoundary>
      )
      
      expect(screen.getByText('Custom Error Message')).toBeInTheDocument()
      expect(screen.queryByText('common.formError')).not.toBeInTheDocument()
    })

    it('should use default fallback when custom not provided', () => {
      render(
        <FormErrorBoundary>
          <ThrowError error="Test error" />
        </FormErrorBoundary>
      )
      
      expect(screen.getByText('common.formError')).toBeInTheDocument()
    })
  })
})
