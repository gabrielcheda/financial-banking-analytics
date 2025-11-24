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

  // Validation errors (client-side)
  { pattern: /Passwords do not match/i, key: 'errors.validation.passwordsDoNotMatch' },
  { pattern: /Invalid phone number/i, key: 'errors.validation.invalidPhoneNumber' },
  { pattern: /Registration failed/i, key: 'errors.validation.registrationFailed' },
  
  // DTO Validation errors (backend)
  { pattern: /Please provide a valid email address/i, key: 'errors.validation.validEmailAddress' },
  { pattern: /Password must be at least 8 characters long/i, key: 'errors.validation.passwordMinLength' },
  { pattern: /Password must not exceed 50 characters/i, key: 'errors.validation.passwordMaxLength' },
  { pattern: /Password must contain at least one uppercase letter/i, key: 'errors.validation.passwordRequirements' },
  { pattern: /Avatar must be a valid base64/i, key: 'errors.validation.avatarFormat' },
  { pattern: /Reminder time must be in HH:MM format/i, key: 'errors.validation.reminderTimeFormat' },
  { pattern: /Search query must not exceed 100 characters/i, key: 'errors.validation.searchQueryMaxLength' },
  { pattern: /Each tag must not exceed 30 characters/i, key: 'errors.validation.tagMaxLength' },
  { pattern: /Maximum of 10 tags allowed/i, key: 'errors.validation.maxTagsAllowed' },
  { pattern: /Merchant name must not exceed 50 characters/i, key: 'errors.validation.merchantNameMaxLength' },
  { pattern: /sortBy must be one of/i, key: 'errors.validation.sortByOptions' },
  { pattern: /sortOrder must be either ASC or DESC/i, key: 'errors.validation.sortOrderOptions' },
  { pattern: /Name is required/i, key: 'errors.validation.nameRequired' },
  { pattern: /Name must be a string/i, key: 'errors.validation.nameMustBeString' },
  { pattern: /Name must not exceed 255 characters/i, key: 'errors.validation.nameMaxLength' },
  { pattern: /Phone must be a string/i, key: 'errors.validation.phoneMustBeString' },
  { pattern: /Phone must not exceed 20 characters/i, key: 'errors.validation.phoneMaxLength' },
  { pattern: /Color must be a valid hexadecimal color/i, key: 'errors.validation.validHexColor' },
  { pattern: /Icon must be a string/i, key: 'errors.validation.iconMustBeString' },
  { pattern: /Icon must not exceed 50 characters/i, key: 'errors.validation.iconMaxLength' },
  { pattern: /Category is required/i, key: 'errors.validation.categoryRequired' },
  { pattern: /Category ID must be a valid UUID/i, key: 'errors.validation.validUUID' },
  { pattern: /Category name must be a string/i, key: 'errors.validation.categoryNameMustBeString' },
  { pattern: /Category name must not exceed 100 characters/i, key: 'errors.validation.categoryNameMaxLength' },
  { pattern: /Category type is required/i, key: 'errors.validation.categoryTypeRequired' },
  { pattern: /Category type must be either income or expense/i, key: 'errors.validation.categoryTypeOptions' },
  { pattern: /IsActive must be a boolean value/i, key: 'errors.validation.isActiveMustBeBoolean' },
  { pattern: /Parent category ID must be a string/i, key: 'errors.validation.parentCategoryMustBeString' },
  { pattern: /Amount must be greater than 0/i, key: 'errors.validation.amountMinValue' },
  { pattern: /Account name must be at least 2 characters long/i, key: 'errors.validation.accountNameMinLength' },
  { pattern: /Account name must not exceed 100 characters/i, key: 'errors.validation.accountNameMaxLength' },
  { pattern: /Type must be one of: checking, savings, credit, investment/i, key: 'errors.validation.accountTypeOptions' },
  { pattern: /Balance must be a valid number/i, key: 'errors.validation.balanceMustBeNumber' },
  { pattern: /Balance cannot be negative/i, key: 'errors.validation.balanceCannotBeNegative' },
  { pattern: /Currency code must be 3 characters/i, key: 'errors.validation.currencyCodeLength' },
  { pattern: /Account number must not exceed 50 characters/i, key: 'errors.validation.accountNumberMaxLength' },
  { pattern: /Institution name must not exceed 100 characters/i, key: 'errors.validation.institutionNameMaxLength' },
  
  // Generic validation patterns (class-validator defaults)
  { pattern: /^(\w+\s+)?must be a string$/i, key: 'errors.validation.mustBeString' },
  { pattern: /^(\w+\s+)?must be a number( that )?/i, key: 'errors.validation.mustBeNumber' },
  { pattern: /^(\w+\s+)?must be a boolean( value)?$/i, key: 'errors.validation.mustBeBoolean' },
  { pattern: /^(\w+\s+)?must be an email$/i, key: 'errors.validation.mustBeEmail' },
  { pattern: /^(\w+\s+)?should not be empty$/i, key: 'errors.validation.isNotEmpty' },
  { pattern: /^(\w+\s+)?must be longer than or equal to \d+ characters$/i, key: 'errors.validation.minLength' },
  { pattern: /^(\w+\s+)?must be shorter than or equal to \d+ characters$/i, key: 'errors.validation.maxLength' },
  { pattern: /^(\w+\s+)?must not be less than/i, key: 'errors.validation.min' },
  { pattern: /^(\w+\s+)?must not be greater than/i, key: 'errors.validation.max' },
  { pattern: /^(\w+\s+)?must be one of the following values:/i, key: 'errors.validation.isIn' },
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
