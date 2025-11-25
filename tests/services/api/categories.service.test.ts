/**
 * Tests for Categories Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { categoryService } from '@/services/api/categories.service'
import { apiClient } from '@/services/api/client'
import type { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '@/types/dto'

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  unwrapResponse: vi.fn((response) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }),
}))

describe('Categories Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should get all categories', async () => {
      const mockCategories: CategoryDTO[] = [
        {
          id: '1',
          name: 'Food',
          type: 'expense' as const,
          icon: '🍔',
          color: '#FF5733',
          isDefault: false,
          userId: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories })

      const result = await categoryService.getCategories()

      expect(apiClient.get).toHaveBeenCalledWith('/categories')
      expect(result).toEqual(mockCategories)
    })

    it('should get categories filtered by type', async () => {
      const mockCategories: CategoryDTO[] = []

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories })

      const result = await categoryService.getCategories({ type: 'income' })

      expect(apiClient.get).toHaveBeenCalledWith('/categories?type=income')
      expect(result).toEqual(mockCategories)
    })
  })

  describe('getDefaultCategories', () => {
    it('should get default categories', async () => {
      const mockCategories: CategoryDTO[] = [
        {
          id: '1',
          name: 'Salary',
          type: 'income' as const,
          icon: '💰',
          color: '#4CAF50',
          isDefault: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories })

      const result = await categoryService.getDefaultCategories()

      expect(apiClient.get).toHaveBeenCalledWith('/categories/defaults')
      expect(result).toEqual(mockCategories)
    })
  })

  describe('getCategoryById', () => {
    it('should get category by id', async () => {
      const mockCategory: CategoryDTO = {
        id: '1',
        name: 'Food',
        type: 'expense' as const,
        icon: '🍔',
        color: '#FF5733',
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategory })

      const result = await categoryService.getCategoryById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/categories/1')
      expect(result).toEqual(mockCategory)
    })
  })

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const createData: CreateCategoryDTO = {
        name: 'Entertainment',
        type: 'expense' as const,
        icon: '🎬',
        color: '#9C27B0',
      }

      const mockCategory: CategoryDTO = {
        id: '1',
        name: 'Entertainment',
        type: 'expense' as const,
        icon: '🎬',
        color: '#9C27B0',
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCategory })

      const result = await categoryService.createCategory(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/categories', createData)
      expect(result).toEqual(mockCategory)
    })
  })

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData: UpdateCategoryDTO = {
        name: 'Food & Dining',
        color: '#FF6347',
      }

      const mockCategory: CategoryDTO = {
        id: '1',
        name: 'Food & Dining',
        type: 'expense' as const,
        icon: '🍔',
        color: '#FF6347',
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockCategory })

      const result = await categoryService.updateCategory('1', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/categories/1', updateData)
      expect(result).toEqual(mockCategory)
    })
  })

  describe('deleteCategory', () => {
    it('should delete category and reassign transactions', async () => {
      const mockResponse = {
        message: 'Category deleted successfully',
        transactionsReassigned: 5,
      }

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse })

      const result = await categoryService.deleteCategory('1', 'cat-2')

      expect(apiClient.delete).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })
})
