/**
 * API Client - Axios instance configurado com interceptors
 *
 * Features:
 * - Auto-refresh de tokens
 * - Error handling centralizado
 * - Request/Response logging
 * - Timeout configurável
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError, NormalizedError } from '@/types/dto'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:3001/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request Interceptor - Adiciona CSRF token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // ✅ Tokens são enviados automaticamente via httpOnly cookies
        // Não precisamos adicionar Authorization header manualmente

        // ✅ Garantir que cookies sejam enviados com a requisição
        config.withCredentials = true

        // ✅ Adicionar CSRF token para requisições state-changing
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
          const csrfToken = this.getCookie('csrf-token')
          if (csrfToken && config.headers) {
            config.headers['X-CSRF-Token'] = csrfToken
          }
        }

        // Log request em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          })
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response Interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Log response em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
          })
        }

        // Se a resposta tem a estrutura { success: true, data: {...} }, extrair apenas data
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          return response.data
        }

        return response.data
      },
      async (error: AxiosError<ApiError>) => {
        // Log error em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            error: error.response?.data,
          })
        }

        // ✅ Token expirado - redirect to login
        // Com httpOnly cookies, o refresh é automático no backend
        // Se ainda assim recebemos 401, significa que a sessão expirou
        if (error.response?.status === 401) {
          this.handleUnauthorized()
          return Promise.reject(this.normalizeError(error))
        }

        // Outros erros
        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  private normalizeError(error: AxiosError<ApiError>): NormalizedError {
    if (error.response?.data) {
      // Server respondeu com erro no formato NestJS
      const data = (error.response.data as any).data

      // Normaliza mensagens - pode ser string ou array
      const messages = Array.isArray(data.error.message)
        ? data.error.message
        : [data.error.message]

      return {
        message: messages[0] || 'An error occurred', // Primeira mensagem como principal
        messages, // Todas as mensagens
        code: data.error.code || 'UNKNOWN_ERROR',
        status: error.response.status,
        timestamp: new Date().toISOString(),
        path: error.response.config.url,
        requestId: data.requestId,
      }
    } else if (error.request) {
      // Request foi feito mas sem resposta
      return {
        message: 'No response from server. Please check your internet connection.',
        messages: ['No response from server. Please check your internet connection.'],
        code: 'NETWORK_ERROR',
        status: 0,
      }
    } else {
      // Erro ao configurar request
      return {
        message: error.message || 'An unexpected error occurred',
        messages: [error.message || 'An unexpected error occurred'],
        code: 'REQUEST_ERROR',
        status: 0,
      }
    }
  }

  // Cookie helper (for CSRF token only, not for httpOnly cookies)
  private getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }

    return null
  }

  /**
   * Handle 401 Unauthorized - Redirect to login
   * Cookies httpOnly são gerenciados pelo servidor
   */
  private handleUnauthorized(): void {
    if (typeof window === 'undefined') return

    // Evitar múltiplos redirects
    if (window.location.pathname === '/login') return

    // Log para debug
    console.warn('🔒 Session expired or unauthorized. Redirecting to login...')

    // Redirect para login com mensagem
    const currentPath = window.location.pathname
    const redirectUrl = currentPath !== '/login' ? `?from=${encodeURIComponent(currentPath)}` : ''

    window.location.href = `/login${redirectUrl}`
  }

  // Public methods
  public async get<T>(url: string, config = {}): Promise<T> {
    return this.client.get<never, T>(url, config)
  }

  public async post<T>(url: string, data?: unknown, config = {}): Promise<T> {
    return this.client.post<never, T>(url, data, config)
  }

  public async put<T>(url: string, data?: unknown, config = {}): Promise<T> {
    return this.client.put<never, T>(url, data, config)
  }

  public async patch<T>(url: string, data?: unknown, config = {}): Promise<T> {
    return this.client.patch<never, T>(url, data, config)
  }

  public async delete<T>(url: string, config = {}): Promise<T> {
    return this.client.delete<never, T>(url, config)
  }

  // File upload helper
  public async upload<T>(url: string, file: File, additionalData?: Record<string, unknown>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.client.post<never, T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // Download helper
  public async download(url: string, filename: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(link.href)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
