'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
} from 'lucide-react'
import { transactions, categories } from '@/lib/mockData'
import { format } from 'date-fns'

type ReportType = 'monthly' | 'tax' | 'expense' | 'custom'
type ExportFormat = 'pdf' | 'csv' | 'excel'

interface SavedReport {
  id: string
  name: string
  type: ReportType
  dateGenerated: Date
  size: string
}

const savedReports: SavedReport[] = [
  {
    id: 'rep-1',
    name: 'December 2023 Monthly Statement',
    type: 'monthly',
    dateGenerated: new Date('2024-01-05'),
    size: '245 KB',
  },
  {
    id: 'rep-2',
    name: '2023 Tax Summary',
    type: 'tax',
    dateGenerated: new Date('2024-01-15'),
    size: '512 KB',
  },
  {
    id: 'rep-3',
    name: 'Q4 2023 Expense Report',
    type: 'expense',
    dateGenerated: new Date('2024-01-10'),
    size: '186 KB',
  },
]

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')

  const reportTypes = [
    {
      type: 'monthly' as ReportType,
      title: 'Monthly Statement',
      description: 'Complete overview of monthly transactions',
      icon: Calendar,
    },
    {
      type: 'tax' as ReportType,
      title: 'Tax Summary',
      description: 'Annual summary for tax purposes',
      icon: FileText,
    },
    {
      type: 'expense' as ReportType,
      title: 'Expense Report',
      description: 'Detailed expense breakdown',
      icon: FileSpreadsheet,
    },
    {
      type: 'custom' as ReportType,
      title: 'Custom Report',
      description: 'Create your own custom report',
      icon: Filter,
    },
  ]

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const getFilteredTransactions = () => {
    let filteredTransactions = transactions

    // Apply date filters
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredTransactions = filteredTransactions.filter(
        (t) => t.date >= start && t.date <= end
      )
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filteredTransactions = filteredTransactions.filter((t) =>
        selectedCategories.includes(t.category)
      )
    }

    return filteredTransactions
  }

  const generatePreview = () => {
    const filteredTransactions = getFilteredTransactions()

    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = Math.abs(
      filteredTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    )

    return {
      transactions: filteredTransactions.slice(0, 10),
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      count: filteredTransactions.length,
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const filteredTransactions = getFilteredTransactions()

    // CSV Header
    const headers = ['Date', 'Description', 'Category', 'Merchant', 'Type', 'Amount', 'Status']

    // CSV Rows
    const rows = filteredTransactions.map(t => [
      format(t.date, 'yyyy-MM-dd'),
      t.description,
      t.category,
      t.merchant,
      t.type,
      t.amount.toFixed(2),
      t.status
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('CSV report generated successfully!')
  }

  // Export to Excel (XLSX format)
  const exportToExcel = () => {
    const filteredTransactions = getFilteredTransactions()
    const preview = generatePreview()

    // Create Excel-compatible HTML
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4472C4; color: white; font-weight: bold; }
          .summary { background-color: #E7E6E6; font-weight: bold; }
          .income { color: #00B050; }
          .expense { color: #C00000; }
        </style>
      </head>
      <body>
        <h1>Financial Report - ${selectedType.toUpperCase()}</h1>
        <p>Generated: ${format(new Date(), 'MMMM dd, yyyy')}</p>
        ${startDate && endDate ? `<p>Period: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}</p>` : ''}

        <h2>Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Total Transactions</td>
            <td>${preview.count}</td>
          </tr>
          <tr class="income">
            <td>Total Income</td>
            <td>$${preview.totalIncome.toFixed(2)}</td>
          </tr>
          <tr class="expense">
            <td>Total Expenses</td>
            <td>$${preview.totalExpenses.toFixed(2)}</td>
          </tr>
          <tr class="summary">
            <td>Net Income</td>
            <td>$${preview.netIncome.toFixed(2)}</td>
          </tr>
        </table>

        <h2>Transactions</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Merchant</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
          ${filteredTransactions.map(t => `
            <tr>
              <td>${format(t.date, 'MMM dd, yyyy')}</td>
              <td>${t.description}</td>
              <td>${t.category}</td>
              <td>${t.merchant}</td>
              <td>${t.type}</td>
              <td class="${t.type}">${t.type === 'income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</td>
              <td>${t.status}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `financial-report-${format(new Date(), 'yyyy-MM-dd')}.xls`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('Excel report generated successfully!')
  }

  // Export to PDF
  const exportToPDF = () => {
    const filteredTransactions = getFilteredTransactions()
    const preview = generatePreview()

    // Create a printable HTML page
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Financial Report</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .summary-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .summary-card .label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
          }
          .income { color: #059669; }
          .expense { color: #dc2626; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .print-btn {
            background-color: #2563eb;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 20px 0;
          }
          .print-btn:hover {
            background-color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>

        <h1>Financial Report - ${selectedType.toUpperCase()}</h1>
        <p><strong>Generated:</strong> ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        ${startDate && endDate ? `<p><strong>Period:</strong> ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}</p>` : ''}
        ${selectedCategories.length > 0 ? `<p><strong>Categories:</strong> ${selectedCategories.join(', ')}</p>` : ''}

        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Transactions</div>
            <div class="value">${preview.count}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Income</div>
            <div class="value income">$${preview.totalIncome.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Expenses</div>
            <div class="value expense">$${preview.totalExpenses.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Net Income</div>
            <div class="value">${preview.netIncome >= 0 ? '+' : ''}$${preview.netIncome.toFixed(2)}</div>
          </div>
        </div>

        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Merchant</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(t => `
              <tr>
                <td>${format(t.date, 'MMM dd, yyyy')}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${t.merchant}</td>
                <td style="text-transform: capitalize;">${t.type}</td>
                <td class="${t.type}">${t.type === 'income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</td>
                <td style="text-transform: capitalize;">${t.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>Generated by BankDash Financial Analytics Platform</p>
        </div>
      </body>
      </html>
    `

    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(pdfContent)
      printWindow.document.close()
      printWindow.focus()
    } else {
      alert('Please allow popups to generate PDF reports')
    }
  }

  const handleGenerateReport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV()
        break
      case 'excel':
        exportToExcel()
        break
      case 'pdf':
        exportToPDF()
        break
    }
  }

  const preview = generatePreview()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Generate and download financial reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isSelected = selectedType === report.type

          return (
            <button
              key={report.type}
              onClick={() => setSelectedType(report.type)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-3 ${
                  isSelected
                    ? 'text-blue-600'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {report.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.name}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.name)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={exportFormat === 'pdf' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant={exportFormat === 'csv' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat('csv')}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === 'excel' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat('excel')}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                variant="primary"
                onClick={handleGenerateReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate {exportFormat.toUpperCase()} Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {preview.count}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${preview.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ${preview.totalExpenses.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Transaction Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Transactions (Preview - showing first 10)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left py-2 text-gray-500 dark:text-gray-400">
                          Date
                        </th>
                        <th className="text-left py-2 text-gray-500 dark:text-gray-400">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-500 dark:text-gray-400">
                          Category
                        </th>
                        <th className="text-right py-2 text-gray-500 dark:text-gray-400">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {preview.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="py-2 text-gray-700 dark:text-gray-300">
                            {format(transaction.date, 'MMM dd, yyyy')}
                          </td>
                          <td className="py-2 text-gray-900 dark:text-white">
                            {transaction.description}
                          </td>
                          <td className="py-2 text-gray-700 dark:text-gray-300">
                            {transaction.category}
                          </td>
                          <td
                            className={`py-2 text-right font-semibold ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {report.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Generated {format(report.dateGenerated, 'MMM dd, yyyy')} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
