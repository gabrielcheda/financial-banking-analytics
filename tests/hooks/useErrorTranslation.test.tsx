import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useErrorTranslation } from '@/hooks/useErrorTranslation'
import * as I18n from '@/i18n'

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}))

describe('useErrorTranslation', () => {
  describe('translateError', () => {
    it('should translate error key that starts with errors.', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateError('errors.auth.invalidCredentials')

      expect(mockT).toHaveBeenCalledWith('errors.auth.invalidCredentials')
      expect(translated).toBe('translated_errors.auth.invalidCredentials')
    })

    it('should return original message if it does not start with errors.', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateError('Custom error message')

      expect(mockT).not.toHaveBeenCalledWith('Custom error message')
      expect(translated).toBe('Custom error message')
    })

    it('should return unknown error message for undefined', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'errors.network.unknownError') return 'Unknown error occurred'
        return `translated_${key}`
      })
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateError(undefined)

      expect(mockT).toHaveBeenCalledWith('errors.network.unknownError')
      expect(translated).toBe('Unknown error occurred')
    })

    it('should return unknown error message for empty string', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'errors.network.unknownError') return 'Unknown error occurred'
        return `translated_${key}`
      })
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateError('')

      expect(mockT).toHaveBeenCalledWith('errors.network.unknownError')
      expect(translated).toBe('Unknown error occurred')
    })

    it('should handle multiple different error keys', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())

      const errors = [
        'errors.auth.invalidCredentials',
        'errors.network.timeout',
        'errors.validation.required',
      ]

      errors.forEach((error) => {
        const translated = result.current.translateError(error)
        expect(mockT).toHaveBeenCalledWith(error)
        expect(translated).toBe(`translated_${error}`)
      })
    })

    it('should preserve custom error messages', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())

      const customMessages = [
        'Something went wrong',
        'Server is down',
        'Please try again later',
      ]

      customMessages.forEach((message) => {
        const translated = result.current.translateError(message)
        expect(translated).toBe(message)
      })
    })
  })

  describe('translateErrors', () => {
    it('should translate multiple error keys', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const errors = [
        'errors.auth.invalidCredentials',
        'errors.network.timeout',
        'errors.validation.required',
      ]

      const translated = result.current.translateErrors(errors)

      expect(translated).toHaveLength(3)
      expect(translated[0]).toBe('translated_errors.auth.invalidCredentials')
      expect(translated[1]).toBe('translated_errors.network.timeout')
      expect(translated[2]).toBe('translated_errors.validation.required')
    })

    it('should handle mix of error keys and custom messages', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const errors = [
        'errors.auth.invalidCredentials',
        'Custom error message',
        'errors.network.timeout',
      ]

      const translated = result.current.translateErrors(errors)

      expect(translated).toHaveLength(3)
      expect(translated[0]).toBe('translated_errors.auth.invalidCredentials')
      expect(translated[1]).toBe('Custom error message')
      expect(translated[2]).toBe('translated_errors.network.timeout')
    })

    it('should return unknown error for undefined array', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'errors.network.unknownError') return 'Unknown error occurred'
        return `translated_${key}`
      })
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateErrors(undefined)

      expect(translated).toHaveLength(1)
      expect(translated[0]).toBe('Unknown error occurred')
    })

    it('should return unknown error for empty array', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'errors.network.unknownError') return 'Unknown error occurred'
        return `translated_${key}`
      })
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateErrors([])

      expect(translated).toHaveLength(1)
      expect(translated[0]).toBe('Unknown error occurred')
    })

    it('should handle single error in array', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const translated = result.current.translateErrors(['errors.auth.invalidCredentials'])

      expect(translated).toHaveLength(1)
      expect(translated[0]).toBe('translated_errors.auth.invalidCredentials')
    })

    it('should preserve custom messages in array', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())
      const customMessages = ['Custom error 1', 'Custom error 2', 'Custom error 3']

      const translated = result.current.translateErrors(customMessages)

      expect(translated).toHaveLength(3)
      expect(translated).toEqual(customMessages)
    })
  })

  describe('Integration', () => {
    it('should use translation function from i18n context', () => {
      const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'errors.auth.invalidCredentials': 'Invalid username or password',
          'errors.network.timeout': 'Request timed out',
          'errors.network.unknownError': 'An unknown error occurred',
        }
        return translations[key] || key
      })

      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result } = renderHook(() => useErrorTranslation())

      expect(result.current.translateError('errors.auth.invalidCredentials')).toBe(
        'Invalid username or password'
      )
      expect(result.current.translateError('errors.network.timeout')).toBe('Request timed out')
      expect(result.current.translateError(undefined)).toBe('An unknown error occurred')
    })

    it('should memoize functions with useCallback', () => {
      const mockT = vi.fn((key: string) => key)
      vi.mocked(I18n.useI18n).mockReturnValue({
        t: mockT,
        locale: 'en',
        setLocale: vi.fn(),
      })

      const { result, rerender } = renderHook(() => useErrorTranslation())

      const firstTranslateError = result.current.translateError
      const firstTranslateErrors = result.current.translateErrors

      rerender()

      const secondTranslateError = result.current.translateError
      const secondTranslateErrors = result.current.translateErrors

      // Functions should be the same reference due to useCallback
      expect(firstTranslateError).toBe(secondTranslateError)
      expect(firstTranslateErrors).toBe(secondTranslateErrors)
    })
  })
})
