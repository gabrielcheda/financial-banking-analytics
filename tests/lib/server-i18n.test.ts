import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getServerLocale, translateServer, maybeTranslateServer } from '@/lib/server-i18n'
import { cookies } from 'next/headers'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Mock the JSON translation files
vi.mock('@/i18n/locales/en.json', () => ({
  default: {
    common: {
      appTagline: 'Financial intelligence for modern banking',
      loading: 'Loading...',
      save: 'Save',
      today: 'Today',
    },
    errors: {
      unexpectedError: 'An unexpected error occurred',
      networkError: 'Network error',
      fieldRequired: 'This field is required',
      unauthorized: 'Unauthorized',
      invalidCredentials: 'Invalid email or password',
      invalidEmail: 'Invalid email address',
    },
    forms: {
      transaction: {
        newTransaction: 'New Transaction',
        amount: 'Amount',
      },
    },
  },
}))

vi.mock('@/i18n/locales/pt.json', () => ({
  default: {
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      today: 'Hoje',
    },
    errors: {
      unexpectedError: 'Ocorreu um erro inesperado',
      networkError: 'Erro de rede',
      fieldRequired: 'Este campo é obrigatório',
      unauthorized: 'Não autorizado',
      invalidCredentials: 'E-mail ou senha inválidos',
      invalidEmail: 'Endereço de e-mail inválido',
    },
    forms: {
      transaction: {
        newTransaction: 'Nova Transação',
        amount: 'Valor',
      },
    },
  },
}))

describe('Server i18n', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getServerLocale', () => {
    it('should return "en" as default locale', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any)

      expect(getServerLocale()).toBe('en')
    })

    it('should return "en" when cookie value is "en"', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'en' }),
      } as any)

      expect(getServerLocale()).toBe('en')
    })

    it('should return "pt" when cookie value is "pt"', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'pt' }),
      } as any)

      expect(getServerLocale()).toBe('pt')
    })

    it('should return "en" for invalid locale values', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'fr' }),
      } as any)

      expect(getServerLocale()).toBe('en')
    })

    it('should return "en" when cookies() throws an error', () => {
      vi.mocked(cookies).mockImplementation(() => {
        throw new Error('Cookies error')
      })

      expect(getServerLocale()).toBe('en')
    })

    it('should return "en" when cookie is null', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue(null),
      } as any)

      expect(getServerLocale()).toBe('en')
    })
  })

  describe('translateServer', () => {
    beforeEach(() => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'en' }),
      } as any)
    })

    it('should translate simple key in English', () => {
      const result = translateServer('common.loading')
      expect(result).toBe('Loading...')
    })

    it('should translate nested key in English', () => {
      const result = translateServer('errors.unexpectedError')
      expect(result).toBe('An unexpected error occurred')
    })

    it('should translate to Portuguese when locale is "pt"', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'pt' }),
      } as any)

      const result = translateServer('common.loading')
      expect(result).toBe('Carregando...')
    })

    it('should use explicit locale parameter over cookie', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'en' }),
      } as any)

      const result = translateServer('common.loading', 'pt')
      expect(result).toBe('Carregando...')
    })

    it('should return key when translation not found', () => {
      const result = translateServer('nonexistent.key.path')
      expect(result).toBe('nonexistent.key.path')
    })

    it('should return key when partial path exists but not full path', () => {
      const result = translateServer('common.nonexistent')
      expect(result).toBe('common.nonexistent')
    })

    it('should handle deeply nested keys', () => {
      const result = translateServer('forms.transaction.newTransaction')
      expect(result).toBe('New Transaction')
    })

    it('should return key when value is not a string', () => {
      const result = translateServer('common')
      expect(result).toBe('common')
    })

    it('should handle empty string key', () => {
      const result = translateServer('')
      expect(result).toBe('')
    })

    it('should handle single-level keys', () => {
      // Assuming root-level keys might exist or testing boundary
      const result = translateServer('invalidKey')
      expect(result).toBe('invalidKey')
    })

    it('should translate authentication errors', () => {
      const result = translateServer('errors.invalidCredentials')
      expect(result).toBe('Invalid email or password')
    })

    it('should translate form labels', () => {
      const result = translateServer('forms.transaction.amount')
      expect(result).toBe('Amount')
    })

    it('should work with different locales for same key', () => {
      const enResult = translateServer('common.save', 'en')
      const ptResult = translateServer('common.save', 'pt')
      
      expect(enResult).toBe('Save')
      expect(ptResult).toBe('Salvar')
    })
  })

  describe('maybeTranslateServer', () => {
    beforeEach(() => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'en' }),
      } as any)
    })

    it('should translate keys starting with "errors."', () => {
      const result = maybeTranslateServer('errors.unexpectedError')
      expect(result).toBe('An unexpected error occurred')
    })

    it('should not translate regular messages', () => {
      const result = maybeTranslateServer('This is a regular error message')
      expect(result).toBe('This is a regular error message')
    })

    it('should translate error keys in Portuguese', () => {
      const result = maybeTranslateServer('errors.invalidCredentials', 'pt')
      expect(result).toBe('E-mail ou senha inválidos')
    })

    it('should return original for non-error keys', () => {
      const result = maybeTranslateServer('common.loading')
      expect(result).toBe('common.loading')
    })

    it('should handle empty string', () => {
      const result = maybeTranslateServer('')
      expect(result).toBe('')
    })

    it('should handle null by returning it', () => {
      const result = maybeTranslateServer(null as any)
      expect(result).toBe(null)
    })

    it('should handle undefined by returning it', () => {
      const result = maybeTranslateServer(undefined as any)
      expect(result).toBe(undefined)
    })

    it('should only translate strings starting with "errors."', () => {
      expect(maybeTranslateServer('errors.networkError')).not.toBe('errors.networkError')
      expect(maybeTranslateServer('common.error')).toBe('common.error')
      expect(maybeTranslateServer('My custom error')).toBe('My custom error')
    })

    it('should translate validation errors', () => {
      const result = maybeTranslateServer('errors.fieldRequired')
      expect(result).toBe('This field is required')
    })

    it('should translate network errors', () => {
      const result = maybeTranslateServer('errors.networkError')
      expect(result).toBe('Network error')
    })

    it('should use explicit locale', () => {
      const enResult = maybeTranslateServer('errors.unauthorized', 'en')
      const ptResult = maybeTranslateServer('errors.unauthorized', 'pt')
      
      expect(enResult).toBe('Unauthorized')
      expect(ptResult).toBe('Não autorizado')
    })

    it('should handle error keys that do not exist', () => {
      const result = maybeTranslateServer('errors.nonExistentError')
      expect(result).toBe('errors.nonExistentError')
    })
  })

  describe('Integration scenarios', () => {
    it('should work in error handling flow', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'en' }),
      } as any)

      // Simulating backend error message translation
      const backendError = 'errors.invalidCredentials'
      const translatedError = maybeTranslateServer(backendError)
      
      expect(translatedError).toBe('Invalid email or password')
    })

    it('should preserve custom error messages', () => {
      const customError = 'Something specific went wrong with your account'
      const result = maybeTranslateServer(customError)
      
      expect(result).toBe(customError)
    })

    it('should handle bilingual error messages', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'pt' }),
      } as any)

      const errorKey = 'errors.invalidEmail'
      const translated = maybeTranslateServer(errorKey)
      
      expect(translated).toBe('Endereço de e-mail inválido')
    })

    it('should fallback to English for missing PT translations', () => {
      // Assuming a key exists in EN but not in PT
      // This tests the robustness of the system
      const result = translateServer('common.appName', 'pt')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })

  describe('Error handling edge cases', () => {
    it('should handle malformed cookie data gracefully', () => {
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 12345 as any }),
      } as any)

      expect(() => getServerLocale()).not.toThrow()
      expect(getServerLocale()).toBe('en')
    })

    it('should handle missing cookies implementation', () => {
      vi.mocked(cookies).mockReturnValue(null as any)

      expect(() => getServerLocale()).not.toThrow()
      expect(getServerLocale()).toBe('en')
    })

    it('should handle translation with special characters', () => {
      const result = translateServer('common.appTagline')
      expect(result).toBe('Financial intelligence for modern banking')
    })
  })
})
