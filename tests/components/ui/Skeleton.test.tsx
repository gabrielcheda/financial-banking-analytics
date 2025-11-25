import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
} from '@/components/ui/Skeleton'

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('should render with default classes', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded')
    })

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-full" />)
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('h-10', 'w-full', 'animate-pulse')
    })

    it('should support dark mode', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('dark:bg-gray-800')
    })
  })

  describe('SkeletonText', () => {
    it('should render default number of lines', () => {
      const { container } = render(<SkeletonText />)
      const lines = container.querySelectorAll('.animate-pulse')

      expect(lines.length).toBe(3) // default lines
    })

    it('should render custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />)
      const lines = container.querySelectorAll('.animate-pulse')

      expect(lines.length).toBe(5)
    })

    it('should have proper spacing between lines', () => {
      const { container } = render(<SkeletonText lines={3} />)
      const wrapper = container.querySelector('.space-y-3')

      expect(wrapper).toBeTruthy()
    })
  })

  describe('SkeletonCard', () => {
    it('should render card structure', () => {
      const { container } = render(<SkeletonCard />)

      const card = container.querySelector('.rounded-lg')
      expect(card).toHaveClass('border')
    })

    it('should render header skeleton', () => {
      const { container } = render(<SkeletonCard />)
      const header = container.querySelector('.h-6')

      expect(header).toBeInTheDocument()
    })

    it('should render content skeletons', () => {
      const { container } = render(<SkeletonCard />)
      const skeletons = container.querySelectorAll('.animate-pulse')

      expect(skeletons.length).toBeGreaterThan(1)
    })
  })

  describe('SkeletonTable', () => {
    it('should render default number of rows', () => {
      const { container } = render(<SkeletonTable />)
      const rows = container.querySelectorAll('.flex.gap-4.items-center')

      expect(rows.length).toBe(5) // default rows
    })

    it('should render custom number of rows', () => {
      const { container } = render(<SkeletonTable rows={10} />)
      const rows = container.querySelectorAll('.flex.gap-4.items-center')

      expect(rows.length).toBe(10)
    })

    it('should render table header', () => {
      const { container } = render(<SkeletonTable />)
      const header = container.querySelector('.border-b')

      expect(header).toBeTruthy()
    })

    it('should render table body', () => {
      const { container } = render(<SkeletonTable />)
      const skeletons = container.querySelectorAll('.animate-pulse')

      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should have proper table styling', () => {
      const { container } = render(<SkeletonTable />)
      const wrapper = container.querySelector('.space-y-3')

      expect(wrapper).toBeTruthy()
    })
  })

  describe('SkeletonChart', () => {
    it('should render without title', () => {
      const { container } = render(<SkeletonChart />)
      const card = container.querySelector('.rounded-lg')

      expect(card).toBeTruthy()
    })

    it('should render with title', () => {
      const { container } = render(<SkeletonChart title="Chart Title" />)
      // SkeletonChart renders a skeleton in header, not actual title text
      const header = container.querySelector('.h-6.w-48')
      
      expect(header).toBeTruthy()
    })

    it('should render chart area', () => {
      const { container } = render(<SkeletonChart />)
      const chartArea = container.querySelector('.h-64')

      expect(chartArea).toBeInTheDocument()
    })

    it('should have card structure', () => {
      const { container } = render(<SkeletonChart />)
      const card = container.querySelector('.rounded-lg')

      expect(card).toHaveClass('shadow-md', 'border')
    })
  })

  describe('Accessibility', () => {
    it('Skeleton should have aria-hidden', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild

      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })

    it('should not be announced to screen readers', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild

      // Skeleton uses aria-hidden to hide from screen readers
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Animation', () => {
    it('should have pulse animation class', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('SkeletonText lines should animate', () => {
      const { container } = render(<SkeletonText lines={2} />)
      const lines = container.querySelectorAll('.animate-pulse')

      lines.forEach(line => {
        expect(line).toHaveClass('animate-pulse')
      })
    })
  })
})
