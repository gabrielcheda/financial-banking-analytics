/**
 * Tests for Card Components
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should apply default styles', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'border')
    })

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-card')
    })

    it('should support dark mode classes', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700')
    })
  })

  describe('CardHeader', () => {
    it('should render card header with children', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('should apply header styles', () => {
      const { container } = render(<CardHeader>Header</CardHeader>)
      const header = container.firstChild as HTMLElement
      expect(header).toHaveClass('px-4', 'sm:px-6', 'py-3', 'sm:py-4', 'border-b')
    })

    it('should apply custom className to header', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>)
      const header = container.firstChild as HTMLElement
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render card title with children', () => {
      render(<CardTitle>Title</CardTitle>)
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('should render as h3 by default', () => {
      render(<CardTitle>Default Title</CardTitle>)
      const title = screen.getByText('Default Title')
      expect(title.tagName).toBe('H3')
    })

    it('should render with custom heading element', () => {
      render(<CardTitle as="h2">Custom Heading</CardTitle>)
      const title = screen.getByText('Custom Heading')
      expect(title.tagName).toBe('H2')
    })

    it('should render as paragraph when specified', () => {
      render(<CardTitle as="p">Paragraph Title</CardTitle>)
      const title = screen.getByText('Paragraph Title')
      expect(title.tagName).toBe('P')
    })

    it('should apply title styles', () => {
      render(<CardTitle>Styled Title</CardTitle>)
      const title = screen.getByText('Styled Title')
      expect(title).toHaveClass('text-base', 'sm:text-lg', 'font-semibold')
    })

    it('should apply custom className to title', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardContent', () => {
    it('should render card content with children', () => {
      render(<CardContent>Content text</CardContent>)
      expect(screen.getByText('Content text')).toBeInTheDocument()
    })

    it('should apply content styles', () => {
      const { container } = render(<CardContent>Content</CardContent>)
      const content = container.firstChild as HTMLElement
      expect(content).toHaveClass('px-4', 'sm:px-6', 'py-3', 'sm:py-4')
    })

    it('should apply custom className to content', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>)
      const content = container.firstChild as HTMLElement
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('Composition', () => {
    it('should compose card with header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card content here</CardContent>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card content here')).toBeInTheDocument()
    })

    it('should maintain proper DOM structure', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = container.firstChild as HTMLElement
      expect(card.children).toHaveLength(2)
      expect(card.children[0]).toHaveClass('border-b') // header
      expect(card.children[1]).toHaveClass('px-4') // content
    })
  })
})
