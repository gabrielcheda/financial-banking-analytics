/**
 * Utilities for parsing user-provided numeric inputs that may use locale-specific separators.
 */

/**
 * Parses decimal numbers allowing either comma or dot as decimal separator.
 * Returns undefined for empty strings to let validation handle required rules.
 */
export function parseLocaleNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.')
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}

/**
 * Parses integers, trimming whitespaces and handling comma/dot inputs.
 */
export function parseLocaleInteger(value: unknown): number | undefined {
  const parsed = parseLocaleNumber(value)
  if (parsed === undefined) return undefined
  return Math.round(parsed)
}
