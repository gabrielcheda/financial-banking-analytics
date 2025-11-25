/**
 * Tests for QueryProvider Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryProvider } from '@/components/QueryProvider'

describe('QueryProvider', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <QueryProvider>
          <div>Test Child</div>
        </QueryProvider>
      )
      
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should wrap children in provider', () => {
      render(
        <QueryProvider>
          <div>Content</div>
        </QueryProvider>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <QueryProvider>
          <div>Child 1</div>
          <div>Child 2</div>
        </QueryProvider>
      )
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })
})
