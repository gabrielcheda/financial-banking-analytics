/**
 * Transactions Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import type { Metadata } from 'next'
import TransactionsClient from './TransactionsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Transactions | BankDash',
  description: 'Manage and track all your financial transactions with advanced filtering and analytics',
  alternates: {
    canonical: `${baseUrl}/transactions`,
  },
  openGraph: {
    title: 'Transactions | BankDash',
    description: 'Manage and track all your financial transactions with advanced filtering and analytics',
    url: `${baseUrl}/transactions`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transactions | BankDash',
    description: 'Manage and track all your financial transactions with advanced filtering and analytics',
  },
}

export default async function TransactionsPage() {
  return <TransactionsClient />
}
