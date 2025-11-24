/**
 * Date Utilities
 *
 * Funções para manipulação e formatação de datas
 */

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  addDays,
  addMonths,
  subDays,
  subMonths,
  differenceInDays,
  differenceInMonths,
  parseISO,
} from 'date-fns'

/**
 * Formata data de forma inteligente baseada em quão recente ela é
 * NOTA: Retorna chaves de tradução que devem ser traduzidas no componente usando t()
 *
 * @example
 * formatSmartDate(new Date()) // "common.today"
 * formatSmartDate(yesterday) // "common.yesterday"
 * formatSmartDate(lastWeek) // "Last Tuesday" (formatado)
 * formatSmartDate(lastYear) // "Jan 15, 2023" (formatado)
 */
export function formatSmartDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date

  if (isToday(dateObj)) {
    return 'common.today'
  }

  if (isYesterday(dateObj)) {
    return 'common.yesterday'
  }

  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE') // Monday, Tuesday, etc
  }

  if (isThisMonth(dateObj)) {
    return format(dateObj, 'MMM d') // Jan 15
  }

  if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM d') // Jan 15
  }

  return format(dateObj, 'MMM d, yyyy') // Jan 15, 2023
}

/**
 * Formata data relativa (tempo atrás)
 *
 * @example
 * formatRelativeDate(new Date()) // "just now"
 * formatRelativeDate(yesterday) // "1 day ago"
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Formata data e hora
 *
 * @example
 * formatDateTime(new Date()) // "Jan 15, 2024, 3:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM d, yyyy, h:mm a')
}

/**
 * Formata apenas hora
 *
 * @example
 * formatTime(new Date()) // "3:30 PM"
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'h:mm a')
}

/**
 * Períodos predefinidos para filtros
 * NOTA: Os labels são chaves de tradução e devem ser traduzidos com t() quando exibidos
 */
export const dateRanges = {
  today: {
    label: 'common.today',
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  },
  yesterday: {
    label: 'common.yesterday',
    start: startOfDay(subDays(new Date(), 1)),
    end: endOfDay(subDays(new Date(), 1)),
  },
  last7days: {
    label: 'common.last7Days',
    start: startOfDay(subDays(new Date(), 7)),
    end: endOfDay(new Date()),
  },
  last30days: {
    label: 'common.last30Days',
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date()),
  },
  thisWeek: {
    label: 'common.thisWeek',
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  },
  thisMonth: {
    label: 'common.thisMonth',
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  },
  lastMonth: {
    label: 'common.lastMonth',
    start: startOfMonth(subMonths(new Date(), 1)),
    end: endOfMonth(subMonths(new Date(), 1)),
  },
  thisYear: {
    label: 'common.thisYear',
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  },
  lastYear: {
    label: 'common.lastYear',
    start: startOfYear(subDays(new Date(), 365)),
    end: endOfYear(subDays(new Date(), 365)),
  },
  allTime: {
    label: 'common.allTime',
    start: new Date('2020-01-01'),
    end: new Date(),
  },
} as const

export type DateRangeKey = keyof typeof dateRanges

/**
 * Obtém range de datas por key
 */
export function getDateRange(key: DateRangeKey) {
  return dateRanges[key]
}

/**
 * Gera array de meses para os últimos N meses
 *
 * @example
 * getLastMonths(6) // ['Jan 2024', 'Feb 2024', ...]
 */
export function getLastMonths(count: number): string[] {
  const months: string[] = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    months.push(format(date, 'MMM yyyy'))
  }

  return months
}

/**
 * Gera array de dias para os últimos N dias
 *
 * @example
 * getLastDays(7) // ['Jan 10', 'Jan 11', ...]
 */
export function getLastDays(count: number): string[] {
  const days: string[] = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const date = subDays(now, i)
    days.push(format(date, 'MMM d'))
  }

  return days
}

/**
 * Calcula dias até deadline
 *
 * @example
 * getDaysUntil('2024-12-31') // 350
 */
export function getDaysUntil(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return differenceInDays(dateObj, new Date())
}

/**
 * Calcula meses até deadline
 */
export function getMonthsUntil(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return differenceInMonths(dateObj, new Date())
}

/**
 * Verifica se data é futura
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj > new Date()
}

/**
 * Verifica se data é passada
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj < new Date()
}

/**
 * Verifica se data está próxima (nos próximos N dias)
 */
export function isUpcoming(date: Date | string, days: number = 7): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const daysUntil = getDaysUntil(dateObj)
  return daysUntil >= 0 && daysUntil <= days
}

/**
 * Formata para input type="date"
 *
 * @example
 * formatForInput(new Date()) // "2024-01-15"
 */
export function formatForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Formata período de datas
 *
 * @example
 * formatDateRange(start, end) // "Jan 1 - Jan 31, 2024"
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startObj = typeof start === 'string' ? parseISO(start) : start
  const endObj = typeof end === 'string' ? parseISO(end) : end

  if (format(startObj, 'yyyy') === format(endObj, 'yyyy')) {
    if (format(startObj, 'MM') === format(endObj, 'MM')) {
      return `${format(startObj, 'MMM d')} - ${format(endObj, 'd, yyyy')}`
    }
    return `${format(startObj, 'MMM d')} - ${format(endObj, 'MMM d, yyyy')}`
  }

  return `${format(startObj, 'MMM d, yyyy')} - ${format(endObj, 'MMM d, yyyy')}`
}
