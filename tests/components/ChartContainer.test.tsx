/**
 * Tests for ChartContainer Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartContainer } from '@/components/ChartContainer'

describe('ChartContainer', () => {
  describe('Rendering', () => {
    it('should render title', () => {
      render(
        <ChartContainer title="Revenue Chart">
          <div>Chart Content</div>
        </ChartContainer>
      )
      expect(screen.getByText('Revenue Chart')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
      render(
        <ChartContainer title="Revenue Chart" description="Monthly revenue data">
          <div>Chart Content</div>
        </ChartContainer>
      )
      expect(screen.getByText('Monthly revenue data')).toBeInTheDocument()
    })

    it('should not render description when not provided', () => {
      render(
        <ChartContainer title="Revenue Chart">
          <div>Chart Content</div>
        </ChartContainer>
      )
      expect(screen.queryByText('Monthly revenue data')).not.toBeInTheDocument()
    })

    it('should render children', () => {
      render(
        <ChartContainer title="Revenue Chart">
          <div>Chart Content</div>
        </ChartContainer>
      )
      expect(screen.getByText('Chart Content')).toBeInTheDocument()
    })

    it('should render action button when provided', () => {
      render(
        <ChartContainer 
          title="Revenue Chart" 
          action={<button>Export</button>}
        >
          <div>Chart Content</div>
        </ChartContainer>
      )
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    it('should not render action when not provided', () => {
      render(
        <ChartContainer title="Revenue Chart">
          <div>Chart Content</div>
        </ChartContainer>
      )
      expect(screen.queryByText('Export')).not.toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render multiple children', () => {
      render(
        <ChartContainer title="Revenue Chart">
          <div>Chart 1</div>
          <div>Chart 2</div>
        </ChartContainer>
      )
      expect(screen.getByText('Chart 1')).toBeInTheDocument()
      expect(screen.getByText('Chart 2')).toBeInTheDocument()
    })

    it('should render complex children', () => {
      render(
        <ChartContainer title="Revenue Chart">
          <div>
            <span>Label:</span>
            <strong>Value</strong>
          </div>
        </ChartContainer>
      )
      expect(screen.getByText('Label:')).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()
    })
  })
})
