/**
 * Server-side i18n utilities
 * 
 * Funções para traduzir mensagens no servidor (Server Actions, API Routes)
 * sem depender do React Context
 */

import { cookies } from 'next/headers'
import enTranslations from '@/i18n/locales/en.json'
import ptTranslations from '@/i18n/locales/pt.json'

type Locale = 'en' | 'pt'
type Translations = typeof enTranslations

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  pt: ptTranslations,
}

/**
 * Obtém o locale atual do cookie
 */
export function getServerLocale(): Locale {
  try {
    const cookieStore = cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')
    const locale = localeCookie?.value as Locale
    
    return locale === 'pt' ? 'pt' : 'en'
  } catch {
    return 'en'
  }
}

/**
 * Traduz uma chave i18n no servidor
 * 
 * @param key - Chave de tradução (ex: "errors.auth.invalidCredentials")
 * @param locale - Locale opcional (se não fornecido, usa o cookie)
 * @returns Tradução ou a própria chave se não encontrada
 * 
 * @example
 * translateServer('errors.auth.invalidCredentials') // "Invalid credentials" ou "Credenciais inválidas"
 */
export function translateServer(key: string, locale?: Locale): string {
  const currentLocale = locale || getServerLocale()
  const dict = translations[currentLocale]
  
  // Navega pela estrutura aninhada usando a chave separada por pontos
  const keys = key.split('.')
  let value: any = dict
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Chave não encontrada, retorna a própria chave
      return key
    }
  }
  
  return typeof value === 'string' ? value : key
}

/**
 * Verifica se uma string é uma chave i18n e traduz se necessário
 * 
 * @param messageOrKey - Mensagem ou chave i18n
 * @param locale - Locale opcional
 * @returns Mensagem traduzida ou original
 */
export function maybeTranslateServer(messageOrKey: string, locale?: Locale): string {
  if (!messageOrKey) return messageOrKey
  
  // Se começa com "errors.", é uma chave i18n
  if (messageOrKey.startsWith('errors.')) {
    return translateServer(messageOrKey, locale)
  }
  
  // Caso contrário, retorna a mensagem original
  return messageOrKey
}
