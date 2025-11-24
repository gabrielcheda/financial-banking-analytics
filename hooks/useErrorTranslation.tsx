import { useI18n } from '@/i18n'
import { useCallback } from 'react'

/**
 * Hook para traduzir mensagens de erro automaticamente
 *
 * Este hook verifica se a mensagem de erro é uma chave i18n (começa com 'errors.')
 * e faz a tradução apropriada. Caso contrário, retorna a mensagem original.
 *
 * @example
 * const { translateError } = useErrorTranslation()
 * toast.error(translateError(error.message))
 */
export function useErrorTranslation() {
  const { t } = useI18n()

  const translateError = useCallback(
    (message: string | undefined): string => {
      if (!message) {
        return t('errors.network.unknownError')
      }

      // Se a mensagem começa com 'errors.', é uma chave i18n
      if (message.startsWith('errors.')) {
        return t(message)
      }

      // Caso contrário, retorna a mensagem original
      // (pode ser um erro customizado ou não mapeado)
      return message
    },
    [t]
  )

  const translateErrors = useCallback(
    (messages: string[] | undefined): string[] => {
      if (!messages || messages.length === 0) {
        return [t('errors.network.unknownError')]
      }

      return messages.map((msg) => {
        if (msg.startsWith('errors.')) {
          return t(msg)
        }
        return msg
      })
    },
    [t]
  )

  return { translateError, translateErrors }
}
