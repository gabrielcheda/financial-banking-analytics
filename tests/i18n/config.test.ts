import { describe, it, expect } from 'vitest'
import { i18n, localeNames, localeFlags } from '@/i18n/config'

describe('i18n config', () => {
  it('should have default locale defined', () => {
    expect(i18n.defaultLocale).toBe('en')
  })

  it('should have locales array with en and pt', () => {
    expect(i18n.locales).toEqual(['en', 'pt'])
    expect(i18n.locales).toHaveLength(2)
  })

  it('should have locale names for all locales', () => {
    expect(localeNames.en).toBe('English')
    expect(localeNames.pt).toBe('Português (BR)')
  })

  it('should have locale flags for all locales', () => {
    expect(localeNames).toHaveProperty('en')
    expect(localeNames).toHaveProperty('pt')
  })

  it('should have flags for all locales', () => {
    expect(localeFlags.en).toBe('🇺🇸')
    expect(localeFlags.pt).toBe('🇧🇷')
  })

  it('should have all locales mapped in localeNames', () => {
    i18n.locales.forEach((locale) => {
      expect(localeNames).toHaveProperty(locale)
    })
  })

  it('should have all locales mapped in localeFlags', () => {
    i18n.locales.forEach((locale) => {
      expect(localeFlags).toHaveProperty(locale)
    })
  })
})
