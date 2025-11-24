import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/error-utils'
import { reportService } from '@/services/api/reports.service'
import type { GenerateReportDTO } from '@/types/dto'

/**
 * Get all reports
 */
export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.getReports(),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Get a specific report
 */
export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportService.getReport(id),
    enabled: !!id,
    staleTime: 30000,
  })
}

/**
 * Generate a new report
 */
export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateReportDTO) => reportService.generateReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to generate report')
    },
  })
}

/**
 * Download a report
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
      reportService.downloadReport(id, filename),
    onSuccess: () => {
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to download report')
    },
  })
}

/**
 * Delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete report')
    },
  })
}

/**
 * Get report status (for polling during generation)
 */
export function useReportStatus(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['reports', id, 'status'],
    queryFn: () => reportService.getReportStatus(id),
    enabled: enabled && !!id,
    refetchInterval: enabled ? 3000 : false, // Poll every 3 seconds when enabled
    staleTime: 0,
  })
}
