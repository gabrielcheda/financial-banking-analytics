/**
 * Error Translator - Mapeia mensagens de erro do backend para chaves de tradução
 *
 * Este módulo centraliza a tradução de todas as mensagens de erro retornadas
 * pelo backend NestJS para chaves i18n, permitindo que os erros sejam exibidos
 * no idioma selecionado pelo usuário.
 */

type ErrorMapping = {
  pattern: string | RegExp
  key: string
}

/**
 * Mapeamento de mensagens de erro do backend para chaves i18n
 * Organizado por módulo para facilitar manutenção
 */
const ERROR_MAPPINGS: ErrorMapping[] = [
  // Auth errors
  { pattern: 'Invalid credentials', key: 'errors.auth.invalidCredentials' },
  { pattern: /User with this email already exists/i, key: 'errors.auth.userExists' },
  { pattern: /Invalid refresh token$/i, key: 'errors.auth.invalidRefreshToken' },
  { pattern: /Invalid or expired refresh token/i, key: 'errors.auth.expiredRefreshToken' },
  { pattern: /Invalid reset token$/i, key: 'errors.auth.invalidResetToken' },
  { pattern: /Invalid or expired reset token/i, key: 'errors.auth.expiredResetToken' },

  // User errors
  { pattern: /Current password is incorrect/i, key: 'errors.users.currentPasswordIncorrect' },
  { pattern: /Password is incorrect/i, key: 'errors.users.passwordIncorrect' },
  { pattern: /Invalid avatar format/i, key: 'errors.users.invalidAvatarFormat' },
  { pattern: /Avatar exceeds the 2MB limit/i, key: 'errors.users.avatarTooLarge' },

  // Account errors
  { pattern: /Account.*not found/i, key: 'errors.accounts.accountNotFound' },
  { pattern: /You do not have access to this account/i, key: 'errors.accounts.noAccess' },
  { pattern: /Cannot delete account with transactions/i, key: 'errors.accounts.hasTransactions' },
  { pattern: /Cannot transfer data to the same account/i, key: 'errors.accounts.cannotTransferToSame' },

  // Transaction errors
  { pattern: /Account does not belong to the user/i, key: 'errors.transactions.accountNotBelongToUser' },
  { pattern: /toAccountId is required for transfer/i, key: 'errors.transactions.toAccountRequired' },
  { pattern: /Destination account does not belong/i, key: 'errors.transactions.destinationNotBelongToUser' },
  { pattern: /Cannot transfer to the same account/i, key: 'errors.transactions.cannotTransferToSame' },
  { pattern: /Transaction.*not found/i, key: 'errors.transactions.transactionNotFound' },
  { pattern: /Month must be between 1 and 12/i, key: 'errors.transactions.invalidMonth' },
  { pattern: /Invalid year/i, key: 'errors.transactions.invalidYear' },
  { pattern: /Search query cannot be empty/i, key: 'errors.transactions.searchQueryEmpty' },
  { pattern: /CSV file is empty or invalid/i, key: 'errors.transactions.csvEmpty' },
  { pattern: /Insufficient columns/i, key: 'errors.transactions.csvInsufficientColumns' },
  { pattern: /Invalid date format/i, key: 'errors.transactions.csvInvalidDate' },
  { pattern: /Invalid amount/i, key: 'errors.transactions.csvInvalidAmount' },
  { pattern: /Invalid type.*must be/i, key: 'errors.transactions.csvInvalidType' },
  { pattern: /Account not found:.*"/i, key: 'errors.transactions.csvAccountNotFound' },
  { pattern: /Category not found:.*"/i, key: 'errors.transactions.csvCategoryNotFound' },

  // Category errors
  { pattern: /Category.*not found/i, key: 'errors.categories.categoryNotFound' },
  { pattern: /Cannot delete default system categories/i, key: 'errors.categories.cannotDeleteDefault' },
  { pattern: /Cannot edit default system categories/i, key: 'errors.categories.cannotEditDefault' },
  { pattern: /category has linked transactions/i, key: 'errors.categories.hasTransactions' },
  { pattern: /category has linked budgets/i, key: 'errors.categories.hasBudgets' },
  { pattern: /Cannot reassign to the same category/i, key: 'errors.categories.cannotReassignToSame' },
  { pattern: /Target category not found/i, key: 'errors.categories.reassignCategoryNotFound' },
  { pattern: /Target category does not belong/i, key: 'errors.categories.reassignCategoryNotBelongToUser' },

  // Budget errors
  { pattern: /Budget.*not found/i, key: 'errors.budgets.budgetNotFound' },
  { pattern: /You do not have access to this budget/i, key: 'errors.budgets.noAccess' },
  { pattern: /End date must be after start date/i, key: 'errors.budgets.endDateBeforeStart' },

  // Bill errors
  { pattern: /Bill.*not found/i, key: 'errors.bills.billNotFound' },
  { pattern: /Bill is already marked as paid/i, key: 'errors.bills.alreadyPaid' },
  { pattern: /Account not found for transaction/i, key: 'errors.bills.accountNotFound' },
  { pattern: /Merchant for this bill was not found/i, key: 'errors.bills.merchantNotFound' },
  { pattern: /Category for this bill was not found/i, key: 'errors.bills.categoryNotFound' },

  // Goal errors
  { pattern: /Goal.*not found/i, key: 'errors.goals.goalNotFound' },
  { pattern: /Cannot contribute to inactive goal/i, key: 'errors.goals.cannotContributeInactive' },

  // Merchant errors
  { pattern: /Merchant.*not found/i, key: 'errors.merchants.merchantNotFound' },

  // Notification errors
  { pattern: /Notification.*not found/i, key: 'errors.notifications.notificationNotFound' },

  // Report errors
  { pattern: /Report.*not found/i, key: 'errors.reports.reportNotFound' },
  { pattern: /You do not have access to this report/i, key: 'errors.reports.noAccess' },
  { pattern: /Start date must be before end date/i, key: 'errors.reports.startDateAfterEnd' },
  { pattern: /Unsupported report format/i, key: 'errors.reports.unsupportedFormat' },
  { pattern: /Report file not found on server/i, key: 'errors.reports.fileNotFound' },
  { pattern: /Report has expired/i, key: 'errors.reports.expired' },
  { pattern: /Failed to read report file/i, key: 'errors.reports.failedToRead' },

  // Generic User not found (deve vir depois dos específicos)
  { pattern: /User.*not found/i, key: 'errors.users.userNotFound' },

  // Network errors (para casos especiais do client.ts)
  { pattern: /No response from server/i, key: 'errors.network.noResponse' },
  { pattern: /Failed to connect to server/i, key: 'errors.network.noResponse' },
  { pattern: /Invalid server response/i, key: 'errors.network.invalidResponse' },
  { pattern: /An unexpected error occurred/i, key: 'errors.network.requestError' },
]

/**
 * Traduz uma mensagem de erro do backend para uma chave i18n
 *
 * @param message - Mensagem de erro retornada pelo backend
 * @returns Chave i18n correspondente ou null se não houver mapeamento
 *
 * @example
 * translateError('Invalid credentials') // 'errors.auth.invalidCredentials'
 * translateError('User not found') // 'errors.users.userNotFound'
 * translateError('Custom error') // null (usa mensagem original)
 */
export function translateError(message: string): string | null {
  if (!message) return null

  for (const mapping of ERROR_MAPPINGS) {
    if (typeof mapping.pattern === 'string') {
      if (message === mapping.pattern) {
        return mapping.key
      }
    } else {
      if (mapping.pattern.test(message)) {
        return mapping.key
      }
    }
  }

  return null
}

/**
 * Traduz múltiplas mensagens de erro
 *
 * @param messages - Array de mensagens de erro
 * @returns Array de chaves i18n (ou mensagens originais se não houver tradução)
 */
export function translateErrors(messages: string[]): Array<string> {
  return messages.map((msg) => translateError(msg) || msg)
}

/**
 * Verifica se uma mensagem tem tradução disponível
 */
export function hasTranslation(message: string): boolean {
  return translateError(message) !== null
}
