/**
 * Tests for ChartErrorBoundary Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary'

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
const WorkingChart = () => <div>Working Chart</div>

describe('ChartErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ChartErrorBoundary>
          <WorkingChart />
        </ChartErrorBoundary>
      )
      
      expect(screen.getByText('Working Chart')).toBeInTheDocument()
    })

    it('should not show error UI when children render successfully', () => {
      render(
        <ChartErrorBoundary>
          <WorkingChart />
        </ChartErrorBoundary>
      )
      
      expect(screen.queryByText('Chart Unavailable')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError error="Chart rendering error" />
        </ChartErrorBoundary>
      )
      
      expect(screen.getByText('Chart Unavailable')).toBeInTheDocument()
    })

    it('should display error icon', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError error="Test error" />
        </ChartErrorBoundary>
      )
      
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Chart Name', () => {
    it('should display custom chart name when provided', () => {
      render(
        <ChartErrorBoundary chartName="Revenue Chart">
          <ThrowError error="Test error" />
        </ChartErrorBoundary>
      )
      
      expect(screen.getByText(/Revenue Chart/i)).toBeInTheDocument()
    })
  })
})
