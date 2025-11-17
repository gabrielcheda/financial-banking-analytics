import type { Metadata } from 'next'
import { defaultLocale } from '@/i18n'

export const metadata: Metadata = {
  title: 'BankDash - Financial Analytics',
  description: 'Modern banking dashboard with comprehensive financial analytics and real-time insights',
  keywords: ['banking', 'finance', 'analytics', 'dashboard', 'transactions', 'budgets'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
