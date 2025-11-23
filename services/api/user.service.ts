import { apiClient } from './client'
import type {
  UserDTO,
  UserPreferencesDTO,
  UpdatePreferencesDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  ApiResponse,
} from '@/types/dto'

class UserService {
  private readonly baseURL = '/users'

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserDTO> {
    const response = await apiClient.get<ApiResponse<UserDTO>>(`/auth/me`)
    return response.data
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileDTO): Promise<UserDTO> {
    const response = await apiClient.put<ApiResponse<UserDTO>>(
      `${this.baseURL}/profile`,
      data
    )
    return response.data
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferencesDTO> {
    const response = await apiClient.get<ApiResponse<UserPreferencesDTO>>(
      `${this.baseURL}/preferences`
    )
    return response.data
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesDTO): Promise<UserPreferencesDTO> {
    const response = await apiClient.put<ApiResponse<UserPreferencesDTO>>(
      `${this.baseURL}/preferences`,
      data
    )
    return response.data
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordDTO): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${this.baseURL}/change-password`,
      data
    )
    return response.data
  }

  /**
   * Upload avatar (Base64)
   */
  async uploadAvatar(base64Image: string): Promise<UserDTO> {
    return await this.updateProfile({ avatar: base64Image })
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${this.baseURL}/account`,
      {
        data: { password },
      }
    )
    return response.data
  }
}

export const userService = new UserService()
