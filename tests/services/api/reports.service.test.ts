/**
 * Tests for Reports Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reportService } from '@/services/api/reports.service'
import { apiClient } from '@/services/api/client'
import type { GenerateReportDTO, ReportDTO, GenerateReportResponseDTO } from '@/types/dto'

// Mock apiClient and DOM APIs
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock DOM APIs for download
global.window = {
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
} as any

global.document = {
  createElement: vi.fn(() => ({
    click: vi.fn(),
    remove: vi.fn(),
  })),
  body: {
    appendChild: vi.fn(),
  },
} as any

global.Blob = vi.fn((content, options) => ({ content, options })) as any

describe('Reports Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateReport', () => {
    it('should generate report successfully', async () => {
      const generateData: GenerateReportDTO = {
        type: 'monthly' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'pdf' as const,
      }

      const mockResponse: GenerateReportResponseDTO = {
        id: 'report-1',
        status: 'generating' as const,
        message: 'Report generation started',
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse })

      const result = await reportService.generateReport(generateData)

      expect(apiClient.post).toHaveBeenCalledWith('/reports/generate', generateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getReports', () => {
    it('should get all reports', async () => {
      const mockReports: ReportDTO[] = [
        {
          id: 'report-1',
          userId: 'user-1',
          type: 'monthly' as const,
          status: 'completed' as const,
          format: 'pdf' as const,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReports })

      const result = await reportService.getReports()

      expect(apiClient.get).toHaveBeenCalledWith('/reports')
      expect(result).toEqual(mockReports)
    })
  })

  describe('getReport', () => {
    it('should get report by id', async () => {
      const mockReport: ReportDTO = {
        id: 'report-1',
        userId: 'user-1',
        type: 'monthly' as const,
        status: 'completed' as const,
        format: 'pdf' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReport })

      const result = await reportService.getReport('report-1')

      expect(apiClient.get).toHaveBeenCalledWith('/reports/report-1')
      expect(result).toEqual(mockReport)
    })
  })

  describe('downloadReport', () => {
    it('should download report with default filename', async () => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' })

      vi.mocked(apiClient.get).mockResolvedValue(mockBlob)

      await reportService.downloadReport('report-1')

      expect(apiClient.get).toHaveBeenCalledWith('/reports/report-1/download', {
        responseType: 'blob',
      })
      expect(global.Blob).toHaveBeenCalled()
      expect(global.window.URL.createObjectURL).toHaveBeenCalled()
    })

    it('should download report with custom filename', async () => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' })

      vi.mocked(apiClient.get).mockResolvedValue(mockBlob)

      await reportService.downloadReport('report-1', 'custom-report.pdf')

      expect(apiClient.get).toHaveBeenCalledWith('/reports/report-1/download', {
        responseType: 'blob',
      })
    })
  })

  describe('deleteReport', () => {
    it('should delete report successfully', async () => {
      const mockResponse = { message: 'Report deleted successfully' }

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse })

      const result = await reportService.deleteReport('report-1')

      expect(apiClient.delete).toHaveBeenCalledWith('/reports/report-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getReportStatus', () => {
    it('should get report status', async () => {
      const mockStatus = { status: 'generating', progress: 75 }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus })

      const result = await reportService.getReportStatus('report-1')

      expect(apiClient.get).toHaveBeenCalledWith('/reports/report-1/status')
      expect(result).toEqual(mockStatus)
    })
  })
})
