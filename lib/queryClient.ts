/**
 * React Query Client Configuration
 *
 * Configuração centralizada do QueryClient com defaults otimizados
 * Suporta SSR com Next.js App Router
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query'
import { cache } from 'react'

const queryConfig: DefaultOptions = {
  queries: {
    // Tempo que os dados são considerados "fresh" (não refetch automaticamente)
    staleTime: 1000 * 60 * 5, // 5 minutos

    // Tempo que dados inativos ficam em cache antes de serem garbage collected
    gcTime: 1000 * 60 * 10, // 10 minutos (era cacheTime antes)

    // Retry automático em caso de erro
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Não refetch ao focar janela (evita requests desnecessários)
    refetchOnWindowFocus: false,

    // Refetch ao reconectar internet
    refetchOnReconnect: true,

    // Refetch ao montar componente se dados estiverem stale
    refetchOnMount: true,
  },
  mutations: {
    // Retry em mutations (desabilitado por padrão)
    retry: 0,
  },
}

// Cliente para uso no client-side (mantém o mesmo durante o lifecycle)
let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

export function getQueryClient() {
  // Server: sempre cria um novo QueryClient
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }

  // Browser: cria apenas uma vez e reutiliza
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

// Para compatibilidade com código existente
export const queryClient = getQueryClient()

// Query Keys Patterns para todo o app
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
  },

  // Accounts
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...queryKeys.accounts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.accounts.lists(), filters] as const,
    details: () => [...queryKeys.accounts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.accounts.details(), id] as const,
    summary: () => [...queryKeys.accounts.all, 'summary'] as const,
  },

  // Transactions
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    stats: (params: Record<string, unknown>) => [...queryKeys.transactions.all, 'stats', params] as const,
  },

  // Budgets
  budgets: {
    all: ['budgets'] as const,
    lists: () => [...queryKeys.budgets.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.budgets.lists(), filters] as const,
    details: () => [...queryKeys.budgets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.budgets.details(), id] as const,
  },

  // Goals
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.goals.lists(), filters] as const,
    details: () => [...queryKeys.goals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.goals.details(), id] as const,
  },

  // Bills
  bills: {
    all: ['bills'] as const,
    lists: () => [...queryKeys.bills.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.bills.lists(), filters] as const,
    details: () => [...queryKeys.bills.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bills.details(), id] as const,
    upcoming: () => [...queryKeys.bills.all, 'upcoming'] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: (params: Record<string, unknown>) => [...queryKeys.analytics.all, 'overview', params] as const,
    spending: (params: Record<string, unknown>) => [...queryKeys.analytics.all, 'spending', params] as const,
    trends: (params: Record<string, unknown>) => [...queryKeys.analytics.all, 'trends', params] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
}
