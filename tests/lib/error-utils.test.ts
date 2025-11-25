import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getErrorMessage,
  getErrorMessages,
  isNormalizedError,
  showErrorToast,
  formatFormError,
  isAuthError,
  isValidationError,
  isNetworkError,
  handleQueryError,
  getUserFriendlyErrorMessage,
} from '@/lib/error-utils'
import { NormalizedError } from '@/types/dto'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe('Error Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getErrorMessage', () => {
    it('should extract message from NormalizedError', () => {
      const error: NormalizedError = {
        message: 'Test error',
        messages: ['Test error'],
        code: 'TEST_ERROR',
        status: 400,
      }
      expect(getErrorMessage(error)).toBe('Test error')
    })

    it('should extract message from object with message property', () => {
      const error = { message: 'Error occurred' }
      expect(getErrorMessage(error)).toBe('Error occurred')
    })

    it('should extract message from string error', () => {
      expect(getErrorMessage('Simple error')).toBe('Simple error')
    })

    it('should return default message for null', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred')
    })

    it('should return default message for undefined', () => {
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
    })

    it('should return default message for unknown types', () => {
      expect(getErrorMessage(123)).toBe('An unexpected error occurred')
      expect(getErrorMessage(true)).toBe('An unexpected error occurred')
      expect(getErrorMessage({})).toBe('An unexpected error occurred')
    })

    it('should convert non-string message to string', () => {
      const error = { message: 123 }
      expect(getErrorMessage(error)).toBe('123')
    })
  })

  describe('getErrorMessages', () => {
    it('should extract messages array from NormalizedError', () => {
      const error: NormalizedError = {
        message: 'Main error',
        messages: ['Error 1', 'Error 2', 'Error 3'],
        code: 'VALIDATION_ERROR',
        status: 422,
      }
      expect(getErrorMessages(error)).toEqual(['Error 1', 'Error 2', 'Error 3'])
    })

    it('should extract array from object with message array', () => {
      const error = { message: ['Error 1', 'Error 2'] }
      expect(getErrorMessages(error)).toEqual(['Error 1', 'Error 2'])
    })

    it('should wrap single message in array', () => {
      const error = { message: 'Single error' }
      expect(getErrorMessages(error)).toEqual(['Single error'])
    })

    it('should wrap string error in array', () => {
      expect(getErrorMessages('Error message')).toEqual(['Error message'])
    })

    it('should return default for null', () => {
      expect(getErrorMessages(null)).toEqual(['An unexpected error occurred'])
    })

    it('should return default for undefined', () => {
      expect(getErrorMessages(undefined)).toEqual(['An unexpected error occurred'])
    })

    it('should convert array items to strings', () => {
      const error = { message: [123, 'error', true] }
      expect(getErrorMessages(error)).toEqual(['123', 'error', 'true'])
    })
  })

  describe('isNormalizedError', () => {
    it('should return true for valid NormalizedError', () => {
      const error: NormalizedError = {
        message: 'Error',
        messages: ['Error'],
        code: 'ERROR',
        status: 500,
      }
      expect(isNormalizedError(error)).toBe(true)
    })

    it('should return true for NormalizedError with optional fields', () => {
      const error: NormalizedError = {
        message: 'Error',
        messages: ['Error'],
        code: 'ERROR',
        status: 500,
        timestamp: '2024-01-01',
        path: '/api/test',
        requestId: 'abc123',
      }
      expect(isNormalizedError(error)).toBe(true)
    })

    it('should return false for missing required fields', () => {
      expect(isNormalizedError({ message: 'Error' })).toBe(false)
      expect(isNormalizedError({ code: 'ERROR' })).toBe(false)
      expect(isNormalizedError({ status: 500 })).toBe(false)
    })

    it('should return false for null', () => {
      expect(isNormalizedError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isNormalizedError(undefined)).toBe(false)
    })

    it('should return false for string', () => {
      expect(isNormalizedError('error')).toBe(false)
    })

    it('should return false for non-object', () => {
      expect(isNormalizedError(123)).toBe(false)
      expect(isNormalizedError(true)).toBe(false)
    })
  })

  describe('showErrorToast', () => {
    it('should show simple toast for single error', () => {
      showErrorToast('Simple error')
      expect(toast.error).toHaveBeenCalledWith('Error', {
        description: 'Simple error',
      })
    })

    it('should use custom title when provided', () => {
      showErrorToast('Error occurred', 'Custom Title')
      expect(toast.error).toHaveBeenCalledWith('Custom Title', {
        description: 'Error occurred',
      })
    })

    it('should show list for multiple validation errors', () => {
      const error: NormalizedError = {
        message: 'Validation failed',
        messages: ['Name is required', 'Email is invalid', 'Password too short'],
        code: 'VALIDATION_ERROR',
        status: 422,
      }
      showErrorToast(error, 'Form Error')
      expect(toast.error).toHaveBeenCalledWith('Form Error', expect.objectContaining({}))
    })

    it('should use default title for multiple errors', () => {
      const error = { message: ['Error 1', 'Error 2'] }
      showErrorToast(error)
      expect(toast.error).toHaveBeenCalled()
    })
  })

  describe('formatFormError', () => {
    it('should format NormalizedError correctly', () => {
      const error: NormalizedError = {
        message: 'Validation failed',
        messages: ['Name is required', 'Email is invalid'],
        code: 'VALIDATION_ERROR',
        status: 422,
      }
      const result = formatFormError(error)
      expect(result).toEqual({
        title: 'Validation Error',
        messages: ['Name is required', 'Email is invalid'],
        status: 422,
      })
    })

    it('should format 400 error correctly', () => {
      const error: NormalizedError = {
        message: 'Bad request',
        messages: ['Bad request'],
        code: 'BAD_REQUEST',
        status: 400,
      }
      const result = formatFormError(error)
      expect(result.title).toBe('Invalid Input')
      expect(result.status).toBe(400)
    })

    it('should format 401 error correctly', () => {
      const error: NormalizedError = {
        message: 'Unauthorized',
        messages: ['Unauthorized'],
        code: 'UNAUTHORIZED',
        status: 401,
      }
      const result = formatFormError(error)
      expect(result.title).toBe('Unauthorized')
    })

    it('should format 403 error correctly', () => {
      const error: NormalizedError = {
        message: 'Forbidden',
        messages: ['Forbidden'],
        code: 'FORBIDDEN',
        status: 403,
      }
      const result = formatFormError(error)
      expect(result.title).toBe('Access Denied')
    })

    it('should format 404 error correctly', () => {
      const error: NormalizedError = {
        message: 'Not found',
        messages: ['Not found'],
        code: 'NOT_FOUND',
        status: 404,
      }
      const result = formatFormError(error)
      expect(result.title).toBe('Not Found')
    })

    it('should format 500 error correctly', () => {
      const error: NormalizedError = {
        message: 'Server error',
        messages: ['Server error'],
        code: 'INTERNAL_ERROR',
        status: 500,
      }
      const result = formatFormError(error)
      expect(result.title).toBe('Server Error')
    })

    it('should format unknown errors', () => {
      const error = 'Unknown error'
      const result = formatFormError(error)
      expect(result).toEqual({
        title: 'Error',
        messages: ['Unknown error'],
      })
    })
  })

  describe('isAuthError', () => {
    it('should return true for 401 status', () => {
      const error: NormalizedError = {
        message: 'Unauthorized',
        messages: ['Unauthorized'],
        code: 'UNAUTHORIZED',
        status: 401,
      }
      expect(isAuthError(error)).toBe(true)
    })

    it('should return true for 403 status', () => {
      const error: NormalizedError = {
        message: 'Forbidden',
        messages: ['Forbidden'],
        code: 'FORBIDDEN',
        status: 403,
      }
      expect(isAuthError(error)).toBe(true)
    })

    it('should return false for other status codes', () => {
      const error: NormalizedError = {
        message: 'Bad request',
        messages: ['Bad request'],
        code: 'BAD_REQUEST',
        status: 400,
      }
      expect(isAuthError(error)).toBe(false)
    })

    it('should return false for non-NormalizedError', () => {
      expect(isAuthError('error')).toBe(false)
      expect(isAuthError({ message: 'error' })).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('should return true for 400 status', () => {
      const error: NormalizedError = {
        message: 'Bad request',
        messages: ['Bad request'],
        code: 'BAD_REQUEST',
        status: 400,
      }
      expect(isValidationError(error)).toBe(true)
    })

    it('should return true for 422 status', () => {
      const error: NormalizedError = {
        message: 'Validation failed',
        messages: ['Validation failed'],
        code: 'VALIDATION_ERROR',
        status: 422,
      }
      expect(isValidationError(error)).toBe(true)
    })

    it('should return false for other status codes', () => {
      const error: NormalizedError = {
        message: 'Server error',
        messages: ['Server error'],
        code: 'INTERNAL_ERROR',
        status: 500,
      }
      expect(isValidationError(error)).toBe(false)
    })

    it('should return false for non-NormalizedError', () => {
      expect(isValidationError('error')).toBe(false)
    })
  })

  describe('isNetworkError', () => {
    it('should return true for NETWORK_ERROR code', () => {
      const error: NormalizedError = {
        message: 'Network error',
        messages: ['Network error'],
        code: 'NETWORK_ERROR',
        status: 0,
      }
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return true for status 0', () => {
      const error: NormalizedError = {
        message: 'No response',
        messages: ['No response'],
        code: 'NO_RESPONSE',
        status: 0,
      }
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return false for other errors', () => {
      const error: NormalizedError = {
        message: 'Server error',
        messages: ['Server error'],
        code: 'INTERNAL_ERROR',
        status: 500,
      }
      expect(isNetworkError(error)).toBe(false)
    })

    it('should return false for non-NormalizedError', () => {
      expect(isNetworkError('error')).toBe(false)
    })
  })

  describe('handleQueryError', () => {
    it('should not show toast for auth errors', () => {
      const error: NormalizedError = {
        message: 'Unauthorized',
        messages: ['Unauthorized'],
        code: 'UNAUTHORIZED',
        status: 401,
      }
      handleQueryError(error)
      expect(toast.error).not.toHaveBeenCalled()
    })

    it('should show connection error for network errors', () => {
      const error: NormalizedError = {
        message: 'Network error',
        messages: ['Network error'],
        code: 'NETWORK_ERROR',
        status: 0,
      }
      handleQueryError(error)
      expect(toast.error).toHaveBeenCalledWith('Connection Error', {
        description: 'Please check your internet connection and try again.',
      })
    })

    it('should show error toast for other errors', () => {
      const error: NormalizedError = {
        message: 'Server error',
        messages: ['Server error'],
        code: 'INTERNAL_ERROR',
        status: 500,
      }
      handleQueryError(error)
      expect(toast.error).toHaveBeenCalled()
    })
  })

  describe('getUserFriendlyErrorMessage', () => {
    it('should return original message for non-NormalizedError', () => {
      expect(getUserFriendlyErrorMessage('Simple error')).toBe('Simple error')
    })

    it('should return friendly message for NETWORK_ERROR', () => {
      const error: NormalizedError = {
        message: 'Network error',
        messages: ['Network error'],
        code: 'NETWORK_ERROR',
        status: 0,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'Unable to connect to the server. Please check your internet connection and try again.'
      )
    })

    it('should return friendly message for TIMEOUT', () => {
      const error: NormalizedError = {
        message: 'Timeout',
        messages: ['Timeout'],
        code: 'TIMEOUT',
        status: 408,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'The request took too long to complete. Please try again.'
      )
    })

    it('should return friendly message for INVALID_CREDENTIALS', () => {
      const error: NormalizedError = {
        message: 'Invalid credentials',
        messages: ['Invalid credentials'],
        code: 'INVALID_CREDENTIALS',
        status: 401,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'The email or password you entered is incorrect.'
      )
    })

    it('should return friendly message for duplicate errors', () => {
      const error: NormalizedError = {
        message: 'Duplicate entry',
        messages: ['Duplicate entry'],
        code: 'DUPLICATE_TRANSACTION',
        status: 409,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'This transaction already exists in your records.'
      )
    })

    it('should return friendly message for 404 errors', () => {
      const error: NormalizedError = {
        message: 'Not found',
        messages: ['Not found'],
        code: 'UNKNOWN_NOT_FOUND',
        status: 404,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe('The requested resource was not found.')
    })

    it('should return friendly message for codes containing "not found"', () => {
      const error: NormalizedError = {
        message: 'Account not found',
        messages: ['Account not found'],
        code: 'ACCOUNT_NOT_FOUND',
        status: 400,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe('The selected account could not be found.')
    })

    it('should return friendly message for codes containing "unauthorized"', () => {
      const error: NormalizedError = {
        message: 'Unauthorized access',
        messages: ['Unauthorized access'],
        code: 'UNAUTHORIZED_ACCESS',
        status: 401,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'Your session has expired. Please log in again.'
      )
    })

    it('should return friendly message for codes containing "forbidden"', () => {
      const error: NormalizedError = {
        message: 'Forbidden',
        messages: ['Forbidden'],
        code: 'FORBIDDEN_RESOURCE',
        status: 403,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        "You don't have permission to perform this action."
      )
    })

    it('should return friendly message for codes containing "balance"', () => {
      const error: NormalizedError = {
        message: 'Insufficient balance',
        messages: ['Insufficient balance'],
        code: 'INSUFFICIENT_BALANCE',
        status: 400,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'Your account balance is insufficient for this transaction.'
      )
    })

    it('should return original message for unknown codes', () => {
      const error: NormalizedError = {
        message: 'Custom error message',
        messages: ['Custom error message'],
        code: 'CUSTOM_ERROR_123',
        status: 500,
      }
      expect(getUserFriendlyErrorMessage(error)).toBe('Custom error message')
    })
  })
})
