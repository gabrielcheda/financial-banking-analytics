import { describe, it, expect } from 'vitest'
import { translateError, translateErrors, hasTranslation } from '@/lib/error-translator'

describe('Error Translator', () => {
  describe('translateError', () => {
    describe('Auth errors', () => {
      it('should translate invalid credentials error', () => {
        expect(translateError('Invalid credentials')).toBe('errors.auth.invalidCredentials')
      })

      it('should translate user exists error', () => {
        expect(translateError('User with this email already exists')).toBe('errors.auth.userExists')
      })

      it('should translate invalid refresh token', () => {
        expect(translateError('Invalid refresh token')).toBe('errors.auth.invalidRefreshToken')
      })

      it('should translate expired refresh token', () => {
        expect(translateError('Invalid or expired refresh token')).toBe('errors.auth.expiredRefreshToken')
      })

      it('should translate invalid reset token', () => {
        expect(translateError('Invalid reset token')).toBe('errors.auth.invalidResetToken')
      })

      it('should translate expired reset token', () => {
        expect(translateError('Invalid or expired reset token')).toBe('errors.auth.expiredResetToken')
      })
    })

    describe('User errors', () => {
      it('should translate current password incorrect', () => {
        expect(translateError('Current password is incorrect')).toBe('errors.users.currentPasswordIncorrect')
      })

      it('should translate password incorrect', () => {
        expect(translateError('Password is incorrect')).toBe('errors.users.passwordIncorrect')
      })

      it('should translate invalid avatar format', () => {
        expect(translateError('Invalid avatar format')).toBe('errors.users.invalidAvatarFormat')
      })

      it('should translate avatar too large', () => {
        expect(translateError('Avatar exceeds the 2MB limit')).toBe('errors.users.avatarTooLarge')
      })

      it('should translate user not found', () => {
        expect(translateError('User not found')).toBe('errors.users.userNotFound')
        expect(translateError('User with ID 123 not found')).toBe('errors.users.userNotFound')
      })
    })

    describe('Account errors', () => {
      it('should translate account not found', () => {
        expect(translateError('Account not found')).toBe('errors.accounts.accountNotFound')
        expect(translateError('Account with ID abc not found')).toBe('errors.accounts.accountNotFound')
      })

      it('should translate no access to account', () => {
        expect(translateError('You do not have access to this account')).toBe('errors.accounts.noAccess')
      })

      it('should translate cannot delete account with transactions', () => {
        expect(translateError('Cannot delete account with transactions')).toBe('errors.accounts.hasTransactions')
      })

      it('should translate cannot transfer to same account', () => {
        expect(translateError('Cannot transfer data to the same account')).toBe('errors.accounts.cannotTransferToSame')
      })
    })

    describe('Transaction errors', () => {
      it('should translate account not belong to user', () => {
        expect(translateError('Account does not belong to the user')).toBe('errors.transactions.accountNotBelongToUser')
      })

      it('should translate toAccountId required', () => {
        expect(translateError('toAccountId is required for transfer')).toBe('errors.transactions.toAccountRequired')
      })

      it('should translate destination account error', () => {
        expect(translateError('Destination account does not belong')).toBe('errors.transactions.destinationNotBelongToUser')
      })

      it('should translate cannot transfer to same', () => {
        expect(translateError('Cannot transfer to the same account')).toBe('errors.transactions.cannotTransferToSame')
      })

      it('should translate transaction not found', () => {
        expect(translateError('Transaction not found')).toBe('errors.transactions.transactionNotFound')
        expect(translateError('Transaction with ID xyz not found')).toBe('errors.transactions.transactionNotFound')
      })

      it('should translate invalid month', () => {
        expect(translateError('Month must be between 1 and 12')).toBe('errors.transactions.invalidMonth')
      })

      it('should translate invalid year', () => {
        expect(translateError('Invalid year')).toBe('errors.transactions.invalidYear')
      })

      it('should translate search query empty', () => {
        expect(translateError('Search query cannot be empty')).toBe('errors.transactions.searchQueryEmpty')
      })

      it('should translate CSV errors', () => {
        expect(translateError('CSV file is empty or invalid')).toBe('errors.transactions.csvEmpty')
        expect(translateError('Insufficient columns')).toBe('errors.transactions.csvInsufficientColumns')
        expect(translateError('Invalid date format')).toBe('errors.transactions.csvInvalidDate')
        expect(translateError('Invalid amount')).toBe('errors.transactions.csvInvalidAmount')
        expect(translateError('Invalid type, must be')).toBe('errors.transactions.csvInvalidType')
        // CSV-specific patterns come AFTER generic account not found pattern in error-translator.ts
        expect(translateError('Account not found: "Checking"')).toBe('errors.accounts.accountNotFound')
        expect(translateError('Category not found: "Food"')).toBe('errors.transactions.csvCategoryNotFound')
      })
    })

    describe('Category errors', () => {
      it('should translate category not found', () => {
        expect(translateError('Category not found')).toBe('errors.categories.categoryNotFound')
        expect(translateError('Category with ID 123 not found')).toBe('errors.categories.categoryNotFound')
      })

      it('should translate cannot delete default categories', () => {
        expect(translateError('Cannot delete default system categories')).toBe('errors.categories.cannotDeleteDefault')
      })

      it('should translate cannot edit default categories', () => {
        expect(translateError('Cannot edit default system categories')).toBe('errors.categories.cannotEditDefault')
      })

      it('should translate category has transactions', () => {
        expect(translateError('category has linked transactions')).toBe('errors.categories.hasTransactions')
      })

      it('should translate category has budgets', () => {
        expect(translateError('category has linked budgets')).toBe('errors.categories.hasBudgets')
      })

      it('should translate cannot reassign to same', () => {
        expect(translateError('Cannot reassign to the same category')).toBe('errors.categories.cannotReassignToSame')
      })

      it('should translate target category errors', () => {
        // Note: 'Target category not found' matches the generic 'Category.*not found' pattern first
        expect(translateError('Target category not found')).toBe('errors.categories.categoryNotFound')
        expect(translateError('Target category does not belong')).toBe('errors.categories.reassignCategoryNotBelongToUser')
      })
    })

    describe('Budget errors', () => {
      it('should translate budget not found', () => {
        expect(translateError('Budget not found')).toBe('errors.budgets.budgetNotFound')
        expect(translateError('Budget with ID abc not found')).toBe('errors.budgets.budgetNotFound')
      })

      it('should translate no access to budget', () => {
        expect(translateError('You do not have access to this budget')).toBe('errors.budgets.noAccess')
      })

      it('should translate end date before start', () => {
        expect(translateError('End date must be after start date')).toBe('errors.budgets.endDateBeforeStart')
      })
    })

    describe('Bill errors', () => {
      it('should translate bill not found', () => {
        expect(translateError('Bill not found')).toBe('errors.bills.billNotFound')
        expect(translateError('Bill with ID 999 not found')).toBe('errors.bills.billNotFound')
      })

      it('should translate bill already paid', () => {
        expect(translateError('Bill is already marked as paid')).toBe('errors.bills.alreadyPaid')
      })

      it('should translate bill-related not found errors', () => {
        // Patterns match in order:
        // - "Account not found for transaction" -> /Account.*not found/i
        // - "Merchant for this bill was not found" -> /Bill.*not found/i (has "bill" keyword)
        // - "Category for this bill was not found" -> /Category.*not found/i (has "Category" first)
        expect(translateError('Account not found for transaction')).toBe('errors.accounts.accountNotFound')
        expect(translateError('Merchant for this bill was not found')).toBe('errors.bills.billNotFound')
        expect(translateError('Category for this bill was not found')).toBe('errors.categories.categoryNotFound')
      })
    })

    describe('Goal errors', () => {
      it('should translate goal not found', () => {
        expect(translateError('Goal not found')).toBe('errors.goals.goalNotFound')
        expect(translateError('Goal with ID xyz not found')).toBe('errors.goals.goalNotFound')
      })

      it('should translate cannot contribute to inactive goal', () => {
        expect(translateError('Cannot contribute to inactive goal')).toBe('errors.goals.cannotContributeInactive')
      })
    })

    describe('Merchant errors', () => {
      it('should translate merchant not found', () => {
        expect(translateError('Merchant not found')).toBe('errors.merchants.merchantNotFound')
        expect(translateError('Merchant with ID 456 not found')).toBe('errors.merchants.merchantNotFound')
      })
    })

    describe('Notification errors', () => {
      it('should translate notification not found', () => {
        expect(translateError('Notification not found')).toBe('errors.notifications.notificationNotFound')
        expect(translateError('Notification with ID abc not found')).toBe('errors.notifications.notificationNotFound')
      })
    })

    describe('Report errors', () => {
      it('should translate report not found', () => {
        expect(translateError('Report not found')).toBe('errors.reports.reportNotFound')
        expect(translateError('Report with ID xyz not found')).toBe('errors.reports.reportNotFound')
      })

      it('should translate no access to report', () => {
        expect(translateError('You do not have access to this report')).toBe('errors.reports.noAccess')
      })

      it('should translate date validation errors', () => {
        expect(translateError('Start date must be before end date')).toBe('errors.reports.startDateAfterEnd')
      })

      it('should translate report format and file errors', () => {
        expect(translateError('Unsupported report format')).toBe('errors.reports.unsupportedFormat')
        // Note: 'Report file not found' matches the generic 'Report.*not found' pattern first
        expect(translateError('Report file not found on server')).toBe('errors.reports.reportNotFound')
        expect(translateError('Report has expired')).toBe('errors.reports.expired')
        expect(translateError('Failed to read report file')).toBe('errors.reports.failedToRead')
      })
    })

    describe('Network errors', () => {
      it('should translate no response errors', () => {
        expect(translateError('No response from server')).toBe('errors.network.noResponse')
        expect(translateError('Failed to connect to server')).toBe('errors.network.noResponse')
      })

      it('should translate invalid response', () => {
        expect(translateError('Invalid server response')).toBe('errors.network.invalidResponse')
      })

      it('should translate unexpected error', () => {
        expect(translateError('An unexpected error occurred')).toBe('errors.network.requestError')
      })
    })

    describe('Validation errors - Client-side', () => {
      it('should translate passwords do not match', () => {
        expect(translateError('Passwords do not match')).toBe('errors.validation.passwordsDoNotMatch')
      })

      it('should translate invalid phone number', () => {
        expect(translateError('Invalid phone number')).toBe('errors.validation.invalidPhoneNumber')
      })

      it('should translate registration failed', () => {
        expect(translateError('Registration failed')).toBe('errors.validation.registrationFailed')
      })
    })

    describe('Validation errors - Backend DTO', () => {
      it('should translate email validation', () => {
        expect(translateError('Please provide a valid email address')).toBe('errors.validation.validEmailAddress')
      })

      it('should translate password validations', () => {
        expect(translateError('Password must be at least 8 characters long')).toBe('errors.validation.passwordMinLength')
        expect(translateError('Password must not exceed 50 characters')).toBe('errors.validation.passwordMaxLength')
        expect(translateError('Password must contain at least one uppercase letter')).toBe('errors.validation.passwordRequirements')
      })

      it('should translate avatar validation', () => {
        expect(translateError('Avatar must be a valid base64')).toBe('errors.validation.avatarFormat')
      })

      it('should translate reminder time validation', () => {
        expect(translateError('Reminder time must be in HH:MM format')).toBe('errors.validation.reminderTimeFormat')
      })

      it('should translate search query validations', () => {
        expect(translateError('Search query must not exceed 100 characters')).toBe('errors.validation.searchQueryMaxLength')
      })

      it('should translate tag validations', () => {
        expect(translateError('Each tag must not exceed 30 characters')).toBe('errors.validation.tagMaxLength')
        expect(translateError('Maximum of 10 tags allowed')).toBe('errors.validation.maxTagsAllowed')
      })

      it('should translate name validations', () => {
        expect(translateError('Name is required')).toBe('errors.validation.nameRequired')
        expect(translateError('Name must be a string')).toBe('errors.validation.nameMustBeString')
        expect(translateError('Name must not exceed 255 characters')).toBe('errors.validation.nameMaxLength')
      })

      it('should translate phone validations', () => {
        expect(translateError('Phone must be a string')).toBe('errors.validation.phoneMustBeString')
        expect(translateError('Phone must not exceed 20 characters')).toBe('errors.validation.phoneMaxLength')
      })

      it('should translate color and icon validations', () => {
        expect(translateError('Color must be a valid hexadecimal color')).toBe('errors.validation.validHexColor')
        expect(translateError('Icon must be a string')).toBe('errors.validation.iconMustBeString')
        expect(translateError('Icon must not exceed 50 characters')).toBe('errors.validation.iconMaxLength')
      })

      it('should translate category validations', () => {
        expect(translateError('Category is required')).toBe('errors.validation.categoryRequired')
        expect(translateError('Category ID must be a valid UUID')).toBe('errors.validation.validUUID')
        // Generic 'must be a string' pattern matches before specific category name pattern
        expect(translateError('Category name must be a string')).toBe('errors.validation.nameMustBeString')
        expect(translateError('Category name must not exceed 100 characters')).toBe('errors.validation.categoryNameMaxLength')
        expect(translateError('Category type is required')).toBe('errors.validation.categoryTypeRequired')
        expect(translateError('Category type must be either income or expense')).toBe('errors.validation.categoryTypeOptions')
      })

      it('should translate boolean validations', () => {
        expect(translateError('IsActive must be a boolean value')).toBe('errors.validation.isActiveMustBeBoolean')
      })

      it('should translate parent category validation', () => {
        expect(translateError('Parent category ID must be a string')).toBe('errors.validation.parentCategoryMustBeString')
      })

      it('should translate amount validations', () => {
        expect(translateError('Amount must be greater than 0')).toBe('errors.validation.amountMinValue')
      })

      it('should translate account name validations', () => {
        expect(translateError('Account name must be at least 2 characters long')).toBe('errors.validation.accountNameMinLength')
        expect(translateError('Account name must not exceed 100 characters')).toBe('errors.validation.accountNameMaxLength')
      })

      it('should translate account type validation', () => {
        expect(translateError('Type must be one of: checking, savings, credit, investment')).toBe('errors.validation.accountTypeOptions')
      })

      it('should translate balance validations', () => {
        expect(translateError('Balance must be a valid number')).toBe('errors.validation.balanceMustBeNumber')
        expect(translateError('Balance cannot be negative')).toBe('errors.validation.balanceCannotBeNegative')
      })

      it('should translate currency and institution validations', () => {
        expect(translateError('Currency code must be 3 characters')).toBe('errors.validation.currencyCodeLength')
        expect(translateError('Account number must not exceed 50 characters')).toBe('errors.validation.accountNumberMaxLength')
        expect(translateError('Institution name must not exceed 100 characters')).toBe('errors.validation.institutionNameMaxLength')
      })

      it('should translate merchant name validation', () => {
        expect(translateError('Merchant name must not exceed 50 characters')).toBe('errors.validation.merchantNameMaxLength')
      })

      it('should translate sort validations', () => {
        expect(translateError('sortBy must be one of')).toBe('errors.validation.sortByOptions')
        expect(translateError('sortOrder must be either ASC or DESC')).toBe('errors.validation.sortOrderOptions')
      })
    })

    describe('Generic validation patterns (class-validator)', () => {
      it('should translate generic must be string', () => {
        expect(translateError('email must be a string')).toBe('errors.validation.mustBeString')
        expect(translateError('must be a string')).toBe('errors.validation.mustBeString')
      })

      it('should translate generic must be number', () => {
        expect(translateError('amount must be a number')).toBe('errors.validation.mustBeNumber')
        expect(translateError('must be a number that')).toBe('errors.validation.mustBeNumber')
      })

      it('should translate generic must be boolean', () => {
        expect(translateError('isActive must be a boolean')).toBe('errors.validation.mustBeBoolean')
        expect(translateError('flag must be a boolean value')).toBe('errors.validation.mustBeBoolean')
      })

      it('should translate generic must be email', () => {
        expect(translateError('email must be an email')).toBe('errors.validation.mustBeEmail')
      })

      it('should translate should not be empty', () => {
        expect(translateError('name should not be empty')).toBe('errors.validation.isNotEmpty')
      })

      it('should translate minLength validation', () => {
        expect(translateError('password must be longer than or equal to 8 characters')).toBe('errors.validation.minLength')
      })

      it('should translate maxLength validation', () => {
        expect(translateError('name must be shorter than or equal to 50 characters')).toBe('errors.validation.maxLength')
      })

      it('should translate min value validation', () => {
        expect(translateError('age must not be less than')).toBe('errors.validation.min')
      })

      it('should translate max value validation', () => {
        expect(translateError('age must not be greater than')).toBe('errors.validation.max')
      })

      it('should translate isIn validation', () => {
        expect(translateError('type must be one of the following values:')).toBe('errors.validation.isIn')
      })
    })

    describe('Edge cases', () => {
      it('should return null for unknown errors', () => {
        expect(translateError('This is a completely unknown error message')).toBeNull()
        expect(translateError('Random error 123')).toBeNull()
      })

      it('should return null for empty string', () => {
        expect(translateError('')).toBeNull()
      })

      it('should handle case-insensitive regex patterns', () => {
        expect(translateError('USER NOT FOUND')).toBe('errors.users.userNotFound')
        expect(translateError('user not found')).toBe('errors.users.userNotFound')
      })
    })
  })

  describe('translateErrors', () => {
    it('should translate multiple errors', () => {
      const messages = [
        'Invalid credentials',
        'User not found',
        'Account not found'
      ]
      const result = translateErrors(messages)
      expect(result).toEqual([
        'errors.auth.invalidCredentials',
        'errors.users.userNotFound',
        'errors.accounts.accountNotFound'
      ])
    })

    it('should keep original message if no translation found', () => {
      const messages = [
        'Invalid credentials',
        'Unknown error message',
        'Account not found'
      ]
      const result = translateErrors(messages)
      expect(result).toEqual([
        'errors.auth.invalidCredentials',
        'Unknown error message',
        'errors.accounts.accountNotFound'
      ])
    })

    it('should handle empty array', () => {
      expect(translateErrors([])).toEqual([])
    })

    it('should handle array with one item', () => {
      expect(translateErrors(['Invalid credentials'])).toEqual(['errors.auth.invalidCredentials'])
    })

    it('should handle all unknown errors', () => {
      const messages = ['Error 1', 'Error 2', 'Error 3']
      const result = translateErrors(messages)
      expect(result).toEqual(['Error 1', 'Error 2', 'Error 3'])
    })
  })

  describe('hasTranslation', () => {
    it('should return true for known errors', () => {
      expect(hasTranslation('Invalid credentials')).toBe(true)
      expect(hasTranslation('User not found')).toBe(true)
      expect(hasTranslation('Account not found')).toBe(true)
    })

    it('should return false for unknown errors', () => {
      expect(hasTranslation('Unknown error')).toBe(false)
      expect(hasTranslation('Random message')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(hasTranslation('')).toBe(false)
    })

    it('should work with regex patterns', () => {
      expect(hasTranslation('Password is incorrect')).toBe(true)
      expect(hasTranslation('Transaction with ID 123 not found')).toBe(true)
    })
  })
})
