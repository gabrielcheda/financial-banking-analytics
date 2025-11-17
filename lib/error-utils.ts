/**
 * Error Utilities - Funções para tratamento de erros
 */

import { createElement } from 'react'
import { NormalizedError } from '@/types/dto'
import { toast } from 'sonner'

/**
 * Extrai a mensagem de erro de diferentes formatos
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred'

  // Se é NormalizedError
  if (isNormalizedError(error)) {
    return error.message
  }

  // Se é um objeto com message
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }

  // Se é string
  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Extrai todas as mensagens de erro (útil para validações)
 */
export function getErrorMessages(error: unknown): string[] {
  if (!error) return ['An unexpected error occurred']

  // Se é NormalizedError com múltiplas mensagens
  if (isNormalizedError(error)) {
    return error.messages
  }

  // Se é um objeto com message que é array
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (Array.isArray(message)) {
      return message.map(String)
    }
    return [String(message)]
  }

  // Se é string
  if (typeof error === 'string') {
    return [error]
  }

  return ['An unexpected error occurred']
}

/**
 * Type guard para NormalizedError
 */
export function isNormalizedError(error: unknown): error is NormalizedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'messages' in error &&
    'code' in error &&
    'status' in error
  )
}

/**
 * Mostra toast de erro com mensagem formatada
 */
export function showErrorToast(error: unknown, title?: string): void {
  const messages = getErrorMessages(error)

  if (messages.length === 1) {
    // Erro simples
    toast.error(title || 'Error', {
      description: messages[0],
    })
  } else {
    // Múltiplos erros de validação
    const description = createElement(
      'ul',
      { className: 'list-disc list-inside space-y-1' },
      messages.map((msg, index) =>
        createElement(
          'li',
          { key: `error-${index}`, className: 'text-sm' },
          msg
        )
      )
    )

    toast.error(title || 'Validation Error', { description })
  }
}

/**
 * Formata erro para exibição em formulários
 */
export function formatFormError(error: unknown): {
  title: string
  messages: string[]
  status?: number
} {
  if (isNormalizedError(error)) {
    return {
      title: getErrorTitle(error.status),
      messages: error.messages,
      status: error.status,
    }
  }

  return {
    title: 'Error',
    messages: getErrorMessages(error),
  }
}

/**
 * Retorna título apropriado baseado no status code
 */
function getErrorTitle(status?: number): string {
  switch (status) {
    case 400:
      return 'Invalid Input'
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Access Denied'
    case 404:
      return 'Not Found'
    case 409:
      return 'Conflict'
    case 422:
      return 'Validation Error'
    case 429:
      return 'Too Many Requests'
    case 500:
      return 'Server Error'
    default:
      return 'Error'
  }
}

/**
 * Verifica se é erro de autenticação
 */
export function isAuthError(error: unknown): boolean {
  if (isNormalizedError(error)) {
    return error.status === 401 || error.status === 403
  }
  return false
}

/**
 * Verifica se é erro de validação
 */
export function isValidationError(error: unknown): boolean {
  if (isNormalizedError(error)) {
    return error.status === 400 || error.status === 422
  }
  return false
}

/**
 * Verifica se é erro de rede
 */
export function isNetworkError(error: unknown): boolean {
  if (isNormalizedError(error)) {
    return error.code === 'NETWORK_ERROR' || error.status === 0
  }
  return false
}

/**
 * Handler genérico de erro para React Query
 */
export function handleQueryError(error: unknown): void {
  if (isAuthError(error)) {
    // Não mostrar toast para erros de auth (já redireciona automaticamente)
    return
  }

  if (isNetworkError(error)) {
    toast.error('Connection Error', {
      description: 'Please check your internet connection and try again.',
    })
    return
  }

  showErrorToast(error)
}

/**
 * Cria mensagem de erro amigável baseada no código
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!isNormalizedError(error)) {
    return getErrorMessage(error)
  }

  // Mensagens customizadas baseadas em códigos comuns
  const code = error.code.toLowerCase()

  if (code.includes('duplicate') || code.includes('already exists')) {
    return 'This item already exists. Please use a different value.'
  }

  if (code.includes('not found') || error.status === 404) {
    return 'The requested resource was not found.'
  }

  if (code.includes('unauthorized') || error.status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  if (code.includes('forbidden') || error.status === 403) {
    return "You don't have permission to perform this action."
  }

  if (code.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  // Retorna mensagem original
  return error.message
}
