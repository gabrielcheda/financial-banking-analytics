/**
 * Tests for DataGrid Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataGrid } from '@/components/ui/DataGrid'

// Mock i18n
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

interface TestItem {
  id: string
  name: string
  amount: number
  date: Date
}

const mockColumns = [
  {
    key: 'name',
    header: 'Name',
    render: (item: TestItem) => item.name,
    sortable: true,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (item: TestItem) => `$${item.amount}`,
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'date',
    header: 'Date',
    render: (item: TestItem) => item.date.toLocaleDateString(),
    align: 'center' as const,
  },
]

const mockData: TestItem[] = [
  { id: '1', name: 'Item 1', amount: 100, date: new Date('2024-01-01') },
  { id: '2', name: 'Item 2', amount: 200, date: new Date('2024-01-02') },
  { id: '3', name: 'Item 3', amount: 300, date: new Date('2024-01-03') },
]

describe('DataGrid', () => {
  describe('Rendering', () => {
    it('should render data grid with columns and rows', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
    })

    it('should render all data rows', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render cell values using render function', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      expect(screen.getByText('$100')).toBeInTheDocument()
      expect(screen.getByText('$200')).toBeInTheDocument()
      expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should render with custom column widths', () => {
      const columnsWithWidth = [
        { ...mockColumns[0], width: '200px' },
        { ...mockColumns[1], width: '100px' },
      ]
      
      const { container } = render(
        <DataGrid
          data={mockData}
          columns={columnsWithWidth}
          keyExtractor={(item) => item.id}
        />
      )
      
      const header = container.querySelector('[role="row"]')
      expect(header).toHaveStyle({ gridTemplateColumns: '200px 100px' })
    })

    it('should apply column alignment', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      // Check the div containing the text, not parentElement
      const amountDiv = screen.getByText('Amount').closest('div')
      expect(amountDiv).toHaveClass('text-right')
      
      const dateDiv = screen.getByText('Date').closest('div')
      expect(dateDiv).toHaveClass('text-center')
    })
  })

  describe('Empty State', () => {
    it('should show default empty message when no data', () => {
      render(
        <DataGrid
          data={[]}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      expect(screen.getByText('common.noResults')).toBeInTheDocument()
    })

    it('should show custom empty message', () => {
      render(
        <DataGrid
          data={[]}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          emptyMessage="No items found"
        />
      )
      
      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should not show table structure when empty', () => {
      render(
        <DataGrid
          data={[]}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      const { container } = render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          isLoading={true}
        />
      )
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show data when loading', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          isLoading={true}
        />
      )
      
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('should render sort buttons for sortable columns', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onSort={vi.fn()}
        />
      )
      
      const nameHeader = screen.getByText('Name').closest('button')
      expect(nameHeader).toBeInTheDocument()
      
      const amountHeader = screen.getByText('Amount').closest('button')
      expect(amountHeader).toBeInTheDocument()
    })

    it('should not render sort button for non-sortable columns', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onSort={vi.fn()}
        />
      )
      
      const dateHeader = screen.getByText('Date').closest('button')
      expect(dateHeader).not.toBeInTheDocument()
    })

    it('should call onSort when sort button clicked', async () => {
      const user = userEvent.setup()
      const handleSort = vi.fn()
      
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onSort={handleSort}
        />
      )
      
      const nameButton = screen.getByText('Name').closest('button')
      if (nameButton) {
        await user.click(nameButton)
        expect(handleSort).toHaveBeenCalledWith('name', 'asc')
      }
    })

    it('should toggle sort direction on second click', async () => {
      const user = userEvent.setup()
      const handleSort = vi.fn()
      
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onSort={handleSort}
          sortColumn="name"
          sortDirection="asc"
        />
      )
      
      const nameButton = screen.getByText('Name').closest('button')
      if (nameButton) {
        await user.click(nameButton)
        expect(handleSort).toHaveBeenCalledWith('name', 'desc')
      }
    })

    it('should show sort indicator on sorted column', () => {
      const { container } = render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onSort={vi.fn()}
          sortColumn="name"
          sortDirection="asc"
        />
      )
      
      const nameHeader = screen.getByText('Name').closest('[role="columnheader"]')
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    })

    it('should update aria-sort for descending order', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onSort={vi.fn()}
          sortColumn="amount"
          sortDirection="desc"
        />
      )
      
      const amountHeader = screen.getByText('Amount').closest('[role="columnheader"]')
      expect(amountHeader).toHaveAttribute('aria-sort', 'descending')
    })
  })

  describe('Row Interaction', () => {
    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup()
      const handleRowClick = vi.fn()
      
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
        />
      )
      
      const row = screen.getByText('Item 1').closest('[role="row"]')
      if (row) {
        await user.click(row)
        expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
      }
    })

    it('should have hover styles when onRowClick is provided', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onRowClick={vi.fn()}
        />
      )
      
      const row = screen.getByText('Item 1').closest('[role="row"]')
      expect(row).toHaveClass('cursor-pointer', 'hover:bg-gray-50')
    })

    it('should not have hover styles when onRowClick is not provided', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const rows = screen.getAllByRole('row')
      const dataRow = rows.find(row => row.textContent?.includes('Item 1'))
      expect(dataRow).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should make rows focusable when onRowClick is provided', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onRowClick={vi.fn()}
        />
      )
      
      const rows = screen.getAllByRole('row')
      const dataRows = rows.filter(row => row.getAttribute('tabIndex') === '0')
      expect(dataRows.length).toBe(mockData.length)
    })

    it('should trigger onRowClick on Enter key', async () => {
      const user = userEvent.setup()
      const handleRowClick = vi.fn()
      
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
        />
      )
      
      const row = screen.getByText('Item 1').closest('[role="row"]') as HTMLElement
      if (row) {
        row.focus()
        await user.keyboard('{Enter}')
        expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
      }
    })

    it('should trigger onRowClick on Space key', async () => {
      const user = userEvent.setup()
      const handleRowClick = vi.fn()
      
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
        />
      )
      
      const row = screen.getByText('Item 1').closest('[role="row"]') as HTMLElement
      if (row) {
        row.focus()
        await user.keyboard('{ }')
        expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
      }
    })
  })

  describe('Accessibility', () => {
    it('should have grid role', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('should have aria-label for data table', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const grid = screen.getByRole('grid')
      expect(grid).toHaveAttribute('aria-label', 'common.dataTable')
    })

    it('should have proper row and column headers', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(mockColumns.length)
    })

    it('should have gridcell roles for data cells', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const cells = screen.getAllByRole('gridcell')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('should have proper aria-rowindex attributes', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows.find(row => row.textContent?.includes('Item 1'))
      expect(firstDataRow).toHaveAttribute('aria-rowindex', '2')
    })

    it('should have proper aria-colindex attributes', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const cells = screen.getAllByRole('gridcell')
      const firstCell = cells[0]
      expect(firstCell).toHaveAttribute('aria-colindex', '1')
    })
  })

  describe('Styling', () => {
    it('should have border and rounded corners', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const grid = screen.getByRole('grid')
      expect(grid).toHaveClass('rounded-lg', 'border')
    })

    it('should support dark mode', () => {
      render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const grid = screen.getByRole('grid')
      expect(grid).toHaveClass('dark:border-gray-700')
    })

    it('should have proper header styling', () => {
      const { container } = render(
        <DataGrid
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      )
      
      const header = container.querySelector('[role="row"].bg-gray-50')
      expect(header).toBeInTheDocument()
    })
  })
})
