'use client'

import { useState, useMemo } from 'react'
import { useI18n } from '@/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  FileText,
  Download,
  Calendar,
  SlidersHorizontal as Filter,
  FileSpreadsheet,
  Receipt,
  Trash2,
  Clock,
} from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useReports, useGenerateReport, useDownloadReport, useDeleteReport } from '@/hooks/useReports'
import { toast } from 'sonner'
import { format, subMonths } from 'date-fns'
import { useBalanceFormatter } from '@/hooks/useBalanceFormatter'
import { BalanceDisplay } from '@/components/BalanceDisplay'

type ReportType = 'monthly' | 'tax' | 'expense' | 'custom'
type ExportFormat = 'pdf' | 'csv' | 'excel'

export default function ReportsClient() {
  const { t } = useI18n()
  const { formatBalance } = useBalanceFormatter()
  
  const [selectedType, setSelectedType] = useState<ReportType>('monthly')
  const [startDate, setStartDate] = useState(
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [useBackendGeneration, setUseBackendGeneration] = useState(false)

  // Fetch categories for filtering
  const { data: categories, isLoading: isLoadingCategories } = useCategories()

  // Backend report hooks
  const { data: savedReports, isLoading: isLoadingReports } = useReports()
  const generateReport = useGenerateReport()
  const downloadReport = useDownloadReport()
  const deleteReport = useDeleteReport()

  // Fetch transactions with filters
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useTransactions({
    dateFrom: startDate,
    dateTo: endDate,
    categoryId: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    limit: 1000, // Get all transactions
  })

  const reportTypes = [
    {
      type: 'monthly' as ReportType,
      title: t('reports.monthlyStatement'),
      description: t('reports.monthlyStatementDesc'),
      icon: Calendar,
    },
    {
      type: 'tax' as ReportType,
      title: t('reports.taxSummary'),
      description: t('reports.taxSummaryDesc'),
      icon: FileText,
    },
    {
      type: 'expense' as ReportType,
      title: t('reports.expenseReport'),
      description: t('reports.expenseReportDesc'),
      icon: FileSpreadsheet,
    },
    {
      type: 'custom' as ReportType,
      title: t('reports.customReport'),
      description: t('reports.customReportDesc'),
      icon: Filter,
    },
  ]

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  // Generate preview from real data
  const preview = useMemo(() => {
    if (!transactionsResponse?.data) {
      return {
        transactions: [],
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        count: 0,
      }
    }

    const transactions = transactionsResponse.data

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = Math.abs(
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    )

    return {
      transactions: transactions.slice(0, 10),
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      count: transactions.length,
    }
  }, [transactionsResponse])

  // Export to CSV
  const exportToCSV = () => {
    if (!transactionsResponse?.data) {
      toast.error(t('reports.noDataToExport'))
      return
    }

    const transactions = transactionsResponse.data

    // CSV Header
    const headers = [
      t('reports.csvDate'),
      t('reports.csvDescription'),
      t('reports.csvCategory'),
      t('reports.csvMerchant'),
      t('reports.csvType'),
      t('reports.csvAmount'),
      t('reports.csvStatus')
    ]

    // CSV Rows
    const rows = transactions.map((t) => {
      const category = categories?.find(c => c.id === t.categoryId)
      return [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.description,
        category?.name || 'Uncategorized',
        t.merchant || 'N/A',
        t.type,
        formatBalance(t.amount),
        t.status,
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    )
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(t('reports.csvGenerated'))
  }

  // Export to Excel (XLSX format)
  const exportToExcel = () => {
    if (!transactionsResponse?.data) {
      toast.error(t('reports.noDataToExport'))
      return
    }

    const transactions = transactionsResponse.data

    // Translations for Excel PDF
    const pdfUncategorized = t('reports.pdfUncategorized')
    const pdfNA = t('reports.pdfNA')

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
        <h1>${t('reports.pdfTitle')} - ${selectedType.toUpperCase()}</h1>
        <p>${t('reports.pdfGenerated')}: ${format(new Date(), 'MMMM dd, yyyy')}</p>
        ${
          startDate && endDate
            ? `<p>${t('reports.pdfPeriod')}: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(
                new Date(endDate),
                'MMM dd, yyyy'
              )}</p>`
            : ''
        }

        <h2>${t('reports.pdfSummary')}</h2>
        <table>
          <tr>
            <th>${t('reports.pdfMetric')}</th>
            <th>${t('reports.pdfValue')}</th>
          </tr>
          <tr>
            <td>${t('reports.pdfTotalTransactions')}</td>
            <td>${preview.count}</td>
          </tr>
          <tr class="income">
            <td>${t('reports.pdfTotalIncome')}</td>
            <td>${formatBalance(Number(preview.totalIncome))}</td>
          </tr>
          <tr class="expense">
            <td>${t('reports.pdfTotalExpenses')}</td>
            <td>${formatBalance(Number(preview.totalExpenses))}</td>
          </tr>
          <tr class="summary">
            <td>${t('reports.pdfNetIncome')}</td>
            <td>${formatBalance(Number(preview.netIncome))}</td>
          </tr>
        </table>

        <h2>${t('reports.pdfTransactions')}</h2>
        <table>
          <tr>
            <th>${t('reports.csvDate')}</th>
            <th>${t('transactions.description')}</th>
            <th>${t('common.category')}</th>
            <th>${t('common.merchant')}</th>
            <th>${t('transactions.type')}</th>
            <th>${t('transactions.amount')}</th>
            <th>${t('transactions.status')}</th>
          </tr>
          ${transactions
            .map(
              (t) => {
                const category = categories?.find(c => c.id === t.categoryId)
                return `
            <tr>
              <td>${format(new Date(t.date), 'MMM dd, yyyy')}</td>
              <td>${t.description}</td>
              <td>${category?.name || pdfUncategorized}</td>
              <td>${t.merchant || pdfNA}</td>
              <td>${t.type}</td>
              <td class="${t.type}">${t.type === 'income' ? '+' : '-'}${formatBalance(Math.abs(
                t.amount
              ), { showSign: false })}</td>
              <td>${t.status}</td>
            </tr>
          `
              }
            )
            .join('')}
        </table>
      </body>
      </html>
    `

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `financial-report-${format(new Date(), 'yyyy-MM-dd')}.xls`
    )
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(t('reports.excelGenerated'))
  }

  // Export to PDF
  const exportToPDF = () => {
    if (!transactionsResponse?.data) {
      toast.error(t('reports.noDataToExport'))
      return
    }

    const transactions = transactionsResponse.data

    // Translations for printable PDF
    const pdfUncategorized = t('reports.pdfUncategorized')
    const pdfNA = t('reports.pdfNA')

    // Create a printable HTML page
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${t('reports.pdfTitle')}</title>
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
        <button class="print-btn no-print" onclick="window.print()">${t('reports.pdfPrintSave')}</button>

        <h1>${t('reports.pdfTitle')} - ${selectedType.toUpperCase()}</h1>
        <p><strong>${t('reports.pdfGenerated')}:</strong> ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        ${
          startDate && endDate
            ? `<p><strong>${t('reports.pdfPeriod')}:</strong> ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(
                new Date(endDate),
                'MMM dd, yyyy'
              )}</p>`
            : ''
        }
        ${
          selectedCategories.length > 0
            ? `<p><strong>${t('common.categories')}:</strong> ${selectedCategories.length} selected</p>`
            : ''
        }

        <h2>${t('reports.pdfSummary')}</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">${t('reports.pdfTotalTransactions')}</div>
            <div class="value">${preview.count}</div>
          </div>
          <div class="summary-card">
            <div class="label">${t('reports.pdfTotalIncome')}</div>
            <div class="value income">${formatBalance(Number(preview.totalIncome))}</div>
          </div>
          <div class="summary-card">
            <div class="label">${t('reports.pdfTotalExpenses')}</div>
            <div class="value expense">${formatBalance(preview.totalExpenses)}</div>
          </div>
          <div class="summary-card">
            <div class="label">${t('reports.pdfNetIncome')}</div>
            <div class="value">${preview.netIncome >= 0 ? '+' : ''}${formatBalance(preview.netIncome)}</div>
          </div>
        </div>

        <h2>${t('transactions.transactionDetails')}</h2>
        <table>
          <thead>
            <tr>
              <th>${t('reports.csvDate')}</th>
              <th>${t('transactions.description')}</th>
              <th>${t('common.category')}</th>
              <th>${t('common.merchant')}</th>
              <th>${t('transactions.type')}</th>
              <th>${t('transactions.amount')}</th>
              <th>${t('transactions.status')}</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (t) => {
                  const category = categories?.find(c => c.id === t.categoryId)
                  return `
              <tr>
                <td>${format(new Date(t.date), 'MMM dd, yyyy')}</td>
                <td>${t.description}</td>
                <td>${category?.name || pdfUncategorized}</td>
                <td>${t.merchant || pdfNA}</td>
                <td style="text-transform: capitalize;">${t.type}</td>
                <td class="${t.type}">${t.type === 'income' ? '+' : '-'}${formatBalance(Math.abs(
                  t.amount
), { showSign: false })}</td>
                <td style="text-transform: capitalize;">${t.status}</td>
              </tr>
            `
                }
              )
              .join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>${t('reports.generatedBy')}</p>
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
      toast.error(t('settings.allowPopups'))
    }
  }

  const handleGenerateReport = async () => {
    if (useBackendGeneration) {
      // Backend generation
      try {
        const result = await generateReport.mutateAsync({
          type: selectedType,
          format: exportFormat,
          startDate,
          endDate,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          includeCharts: true,
          includeTransactionDetails: true,
        })

        toast.success(t('reports.reportGenerated'))

        // Automatically download if available
        if (result.downloadUrl) {
          await downloadReport.mutateAsync({
            id: result.reportId,
            filename: `report-${selectedType}-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`,
          })
        }
      } catch (error: any) {
        toast.error(error.message || t('reports.failedToGenerate'))
      }
    } else {
      // Client-side generation (existing functionality)
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
  }

  const handleDeleteReport = async (reportId: string) => {
    if (confirm(t('settings.confirmDeleteReport'))) {
      try {
        await deleteReport.mutateAsync(reportId)
        toast.success(t('reports.reportDeleted'))
      } catch (error: any) {
        toast.error(t('reports.failedToDelete'))
      }
    }
  }

  const handleDownloadSavedReport = async (reportId: string, reportName: string) => {
    try {
      await downloadReport.mutateAsync({ id: reportId, filename: reportName })
      toast.success(t('reports.downloadStarted'))
    } catch (error: any) {
      toast.error(t('reports.failedToDownload'))
    }
  }

  const isLoading = isLoadingTransactions || isLoadingCategories
  const hasTransactions = transactionsResponse?.data && transactionsResponse.data.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('reports.description')}
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
                  isSelected ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
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
              <CardTitle>{t('reports.reportSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reports.dateRange')}
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
                  {t('reports.categories')}
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isLoadingCategories ? (
                    <p className="text-sm text-gray-500">{t('reports.loadingCategories')}</p>
                  ) : categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {cat.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">{t('reports.noCategories')}</p>
                  )}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reports.exportFormat')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={exportFormat === 'pdf' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    {t('reports.pdf')}
                  </Button>
                  <Button
                    variant={exportFormat === 'csv' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat('csv')}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    {t('reports.csv')}
                  </Button>
                  <Button
                    variant={exportFormat === 'excel' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat('excel')}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    {t('reports.excel')}
                  </Button>
                </div>
              </div>

              {/* Backend Generation Toggle */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useBackendGeneration}
                    onChange={(e) => setUseBackendGeneration(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('reports.useServerGeneration')}
                  </span>
                </label>
              </div>

              <Button
                className="w-full"
                variant="primary"
                onClick={handleGenerateReport}
                disabled={isLoading || generateReport.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                {generateReport.isPending ? t('reports.generating') : `${t('reports.generate')} ${exportFormat.toUpperCase()} ${t('nav.reports')}`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.reportPreview')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !hasTransactions ? (
                <EmptyState
                  icon={Receipt}
                  title={t('reports.noTransactionsFound')}
                  description={t('reports.tryAdjustingFilters')}
                  variant="default"
                />
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('reports.transactions')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {preview.count}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('reports.totalIncome')}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        <BalanceDisplay amount={Number(preview.totalIncome)} showSign={false} />
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('reports.totalExpenses')}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        <BalanceDisplay amount={preview.totalExpenses} showSign={false} />
                      </p>
                    </div>
                  </div>

                  {/* Transaction Preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {t('reports.recentTransactions')}
                    </h4>
                    {preview.transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>{t('reports.noTransactionsFound')}</p>
                        <p className="text-sm mt-2">{t('reports.tryAdjustingFilters')}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="w-full text-sm min-w-[600px]">
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
                            {preview.transactions.map((transaction) => {
                              const category = categories?.find(c => c.id === transaction.categoryId)
                              return (
                              <tr key={transaction.id}>
                                <td className="py-2 text-gray-700 dark:text-gray-300">
                                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-2 text-gray-900 dark:text-white">
                                  {transaction.description}
                                </td>
                                <td className="py-2 text-gray-700 dark:text-gray-300">
                                  {category?.name || 'Uncategorized'}
                                </td>
                                <td
                                  className={`py-2 text-right font-semibold ${
                                    transaction.type === 'income'
                                      ? 'text-green-600'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {transaction.type === 'income' ? '+' : '-'}
                                  <BalanceDisplay amount={Math.abs(transaction.amount)} showSign={false} />
                                </td>
                              </tr>
                            )})}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.savedReports')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !savedReports || savedReports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('reports.noSavedReports')}
              description={t('reports.generateToSave')}
            />
          ) : (
            <div className="space-y-3">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      report.format === 'pdf'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <FileText
                        className={`w-5 h-5 ${
                          report.format === 'pdf'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {report.name || `${report.type} Report`}
                        </h4>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded uppercase">
                          {report.format}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <span>{(report.fileSize / 1024).toFixed(1)} KB</span>
                        <span className="capitalize">{report.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadSavedReport(report.id, report.name)}
                      disabled={report.status !== 'completed' || downloadReport.isPending}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={deleteReport.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
