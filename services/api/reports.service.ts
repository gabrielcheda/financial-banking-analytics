import { apiClient } from './client'
import type {
  GenerateReportDTO,
  ReportDTO,
  GenerateReportResponseDTO,
  ApiResponse,
} from '@/types/dto'

class ReportService {
  private readonly baseURL = '/reports'

  /**
   * Generate a new report
   */
  async generateReport(data: GenerateReportDTO): Promise<GenerateReportResponseDTO> {
    const response = await apiClient.post<ApiResponse<GenerateReportResponseDTO>>(
      `${this.baseURL}/generate`,
      data
    )
    return response.data
  }

  /**
   * Get all reports
   */
  async getReports(): Promise<ReportDTO[]> {
    const response = await apiClient.get<ApiResponse<ReportDTO[]>>(`${this.baseURL}`)
    return response.data
  }

  /**
   * Get a specific report
   */
  async getReport(id: string): Promise<ReportDTO> {
    const response = await apiClient.get<ApiResponse<ReportDTO>>(`${this.baseURL}/${id}`)
    return response.data
  }

  /**
   * Download a report
   */
  async downloadReport(id: string, filename?: string): Promise<void> {
    const response = await apiClient.get(`${this.baseURL}/${id}/download`, {
      responseType: 'blob',
    })

    // Create a blob URL and trigger download
    const blob = new Blob([response as any])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `report-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${this.baseURL}/${id}`
    )
    return response.data
  }

  /**
   * Get report status
   */
  async getReportStatus(id: string): Promise<{ status: string; progress?: number }> {
    const response = await apiClient.get<ApiResponse<{ status: string; progress?: number }>>(
      `${this.baseURL}/${id}/status`
    )
    return response.data
  }
}

export const reportService = new ReportService()
