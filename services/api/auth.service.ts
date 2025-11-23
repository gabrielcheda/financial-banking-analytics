
import { apiClient } from './client'
import type {
  LoginDTO,
  RegisterDTO,
  AuthResponseDTO,
  ApiResponse,
  ApiError} from '@/types/dto'

class AuthService {
  private readonly baseURL = '/auth'
  async login(loginDto: LoginDTO): Promise<AuthResponseDTO> {
    try {
      const response = await apiClient.post<{ success: boolean; data: AuthResponseDTO }>(
        `${this.baseURL}/login`,
        loginDto
      )

      const authData = response.data

      if (authData && authData.tokens) {
        this.saveTokens(
          authData.tokens.accessToken,
          authData.tokens.refreshToken
        )

        if (loginDto.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
      }

      return authData
    } catch (error: any) {
      throw error
    }
  }


  async register(registerDto: RegisterDTO): Promise<AuthResponseDTO> {
    try {
      const response = await apiClient.post<{ success: boolean; data: AuthResponseDTO }>(
        `${this.baseURL}/register`,
        registerDto
      )

      const authData = response.data

      if (authData && authData.tokens) {
        this.saveTokens(
          authData.tokens.accessToken,
          authData.tokens.refreshToken
        )
      }

      return authData
    } catch (error: any) {
      throw error
    }
  }


  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.warn('Client logout failed:', error)
      throw error
    } finally {
      this.clearTokens()
    }
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await apiClient.post<{ success: boolean; data: { accessToken: string; expiresIn: number } }>(
        `${this.baseURL}/refresh`,
        { refreshToken }
      )

      const tokenData = response.data

      if (tokenData) {
        this.saveTokens(
          tokenData.accessToken,
          refreshToken // Mantém o mesmo refresh token
        )
      }

      return tokenData
    } catch (error: any) {
      this.clearTokens()
      throw error
    }
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>(
        `${this.baseURL}/change-password`,
        data
      )
    } catch (error: any) {
      throw error
    }
  }


  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>(
        `${this.baseURL}/forgot-password`,
        { email }
      )
    } catch (error: any) {
      throw error
    }
  }


  async resetPassword(data: {
    token: string
    password: string
  }): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>(
        `${this.baseURL}/reset-password`,
        data
      )
    } catch (error: any) {
      throw error
    }
  }

  // ✅ REMOVIDO: Tokens agora são armazenados apenas em httpOnly cookies
  // Gerenciados pelo servidor via Server Actions
  private saveTokens(accessToken: string, refreshToken: string): void {
    // Tokens são salvos automaticamente via cookies httpOnly nas Server Actions
    // Não precisamos fazer nada aqui no cliente
    return
  }


  private clearTokens(): void {
    // Limpeza é feita via logoutAction() que deleta os cookies httpOnly
    return
  }


  getAccessToken(): string | null {
    // ✅ Tokens httpOnly não são acessíveis via JavaScript
    // Serão enviados automaticamente pelo browser em requests
    return null
  }


  private getRefreshToken(): string | null {
    // ✅ Refresh token está em httpOnly cookie, não acessível
    return null
  }


  isAuthenticated(): boolean {
    // ✅ Com httpOnly cookies, não podemos verificar o token no cliente
    // A autenticação é verificada pelo servidor via middleware
    // Retorna true se houver cookie (verificado via Server Component ou API call)
    if (typeof window === 'undefined') return false

    // Verificamos se o cookie existe (mesmo que não possamos ler o valor)
    return document.cookie.includes('accessToken')
  }

  isApiError(response: any): response is ApiError {
    return response?.success === false && 'error' in response
  }


  isApiSuccess<T>(response: any): response is ApiResponse<T> {
    return response?.success === true && 'data' in response
  }
}

export default new AuthService(); 
