/**
 * Currency Utilities
 *
 * Funções para formatação e manipulação de moeda
 */

/**
 * Formata número como moeda
 *
 * @example
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 * formatCurrency(1234.56, 'BRL') // "R$ 1.234,56"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formata número como moeda compacta (K, M, B)
 *
 * @example
 * formatCurrencyCompact(1234) // "$1.2K"
 * formatCurrencyCompact(1234567) // "$1.2M"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

/**
 * Converte string de moeda para número
 *
 * @example
 * parseCurrency("$1,234.56") // 1234.56
 * parseCurrency("R$ 1.234,56") // 1234.56
 */
export function parseCurrency(value: string): number {
  // Remove tudo exceto números, vírgulas e pontos
  const cleaned = value.replace(/[^\d.,-]/g, '')

  // Detecta se usa vírgula como decimal (formato BR/EU)
  const hasCommaDecimal = /,\d{2}$/.test(cleaned)

  if (hasCommaDecimal) {
    // Formato: 1.234,56 -> 1234.56
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
  } else {
    // Formato: 1,234.56 -> 1234.56
    return parseFloat(cleaned.replace(/,/g, ''))
  }
}

/**
 * Obtém símbolo da moeda
 *
 * @example
 * getCurrencySymbol('USD') // "$"
 * getCurrencySymbol('EUR') // "€"
 * getCurrencySymbol('BRL') // "R$"
 */
export function getCurrencySymbol(currency: string, locale: string = 'en-US'): string {
  return (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim()
}

/**
 * Formata porcentagem
 *
 * @example
 * formatPercentage(0.1234) // "12.34%"
 * formatPercentage(0.1234, 1) // "12.3%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Calcula porcentagem de mudança entre dois valores
 *
 * @example
 * calculatePercentageChange(100, 120) // 20
 * calculatePercentageChange(120, 100) // -16.67
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100
}

/**
 * Formata número grande com abreviação
 *
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Arredonda valor para múltiplo mais próximo
 *
 * @example
 * roundToNearest(1234.56, 5) // 1235
 * roundToNearest(1234.56, 10) // 1230
 */
export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest
}

/**
 * Cores para diferentes tipos de valores monetários
 */
export const currencyColors = {
  positive: 'text-green-600 dark:text-green-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-900 dark:text-white',
} as const

/**
 * Retorna cor baseada no valor
 */
export function getCurrencyColor(value: number): string {
  if (value > 0) return currencyColors.positive
  if (value < 0) return currencyColors.negative
  return currencyColors.neutral
}

/**
 * Moedas suportadas
 */
export const supportedCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
] as const

export type CurrencyCode = typeof supportedCurrencies[number]['code']
