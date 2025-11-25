/**
 * Tests for useReports hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { 
  useReports, 
  useReport, 
  useGenerateReport, 
  useDownloadReport, 
  useDeleteReport,
  useReportStatus
} from '@/hooks/useReports'
import { reportService } from '@/services/api/reports.service'
import * as errorUtils from '@/lib/error-utils'
import type { GenerateReportDTO } from '@/types/dto'

// Mock services
vi.mock('@/services/api/reports.service')
vi.mock('@/lib/error-utils')

describe('useReports Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useReports', () => {
    it('should fetch all reports', async () => {
      const mockReports = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Monthly Report',
          type: 'income-statement' as const,
          status: 'completed' as const,
          createdAt: new Date('2024-01-01'),
          completedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(reportService.getReports).mockResolvedValue(mockReports)

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockReports)
      expect(reportService.getReports).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Fetch failed')
      vi.mocked(reportService.getReports).mockRejectedValue(mockError)

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useReport', () => {
    it('should fetch report by id', async () => {
      const mockReport = {
        id: '1',
        userId: 'user-1',
        name: 'Annual Report',
        type: 'balance-sheet' as const,
        status: 'completed' as const,
        data: { revenues: 10000, expenses: 5000 },
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-01'),
      }

      vi.mocked(reportService.getReport).mockResolvedValue(mockReport)

      const { result } = renderHook(() => useReport('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockReport)
      expect(reportService.getReport).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useReport(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(reportService.getReport).not.toHaveBeenCalled()
    })
  })

  describe('useGenerateReport', () => {
    it('should generate report successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const mockReport = {
        id: '1',
        userId: 'user-1',
        name: 'Generated Report',
        type: 'cash-flow' as const,
        status: 'processing' as const,
        createdAt: new Date(),
      }

      const reportData: GenerateReportDTO = {
        type: 'cash-flow' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        name: 'Generated Report',
      }

      vi.mocked(reportService.generateReport).mockResolvedValue(mockReport)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useGenerateReport(), { wrapper })

      result.current.mutate(reportData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reportService.generateReport).toHaveBeenCalledWith(reportData)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reports'] })
    })

    it('should handle generation error', async () => {
      const mockError = new Error('Generation failed')
      vi.mocked(reportService.generateReport).mockRejectedValue(mockError)

      const { result } = renderHook(() => useGenerateReport(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({} as GenerateReportDTO)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to generate report')
    })
  })

  describe('useDownloadReport', () => {
    it('should download report successfully', async () => {
      const mockBlob = new Blob(['report data'], { type: 'application/pdf' })
      vi.mocked(reportService.downloadReport).mockResolvedValue(mockBlob)

      const { result } = renderHook(() => useDownloadReport(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1', filename: 'report.pdf' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reportService.downloadReport).toHaveBeenCalledWith('1', 'report.pdf')
    })

    it('should handle download error', async () => {
      const mockError = new Error('Download failed')
      vi.mocked(reportService.downloadReport).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDownloadReport(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: '1' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to download report')
    })
  })

  describe('useDeleteReport', () => {
    it('should delete report successfully', async () => {
      const queryClient = new QueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      vi.mocked(reportService.deleteReport).mockResolvedValue({ success: true })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useDeleteReport(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reportService.deleteReport).toHaveBeenCalledWith('1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reports'] })
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed')
      vi.mocked(reportService.deleteReport).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteReport(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(errorUtils.showErrorToast).toHaveBeenCalledWith(mockError, 'Failed to delete report')
    })
  })

  describe('useReportStatus', () => {
    it('should fetch report status when enabled', async () => {
      const mockStatus = {
        id: '1',
        status: 'processing' as const,
        progress: 50,
      }

      vi.mocked(reportService.getReportStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useReportStatus('1', true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStatus)
      expect(reportService.getReportStatus).toHaveBeenCalledWith('1')
    })

    it('should not fetch when disabled', () => {
      const { result } = renderHook(() => useReportStatus('1', false), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(reportService.getReportStatus).not.toHaveBeenCalled()
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useReportStatus('', true), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(reportService.getReportStatus).not.toHaveBeenCalled()
    })
  })
})
