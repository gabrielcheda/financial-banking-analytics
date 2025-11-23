/**
 * Dashboard Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Dashboard | BankDash',
  description: 'View your financial overview, recent transactions, and account balances at a glance',
  alternates: {
    canonical: `${baseUrl}/dashboard`,
  },
  openGraph: {
    title: 'Dashboard | BankDash',
    description: 'View your financial overview, recent transactions, and account balances at a glance',
    url: `${baseUrl}/dashboard`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | BankDash',
    description: 'View your financial overview, recent transactions, and account balances at a glance',
  },
}

export default async function DashboardPage() {
  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BankDash',
    applicationCategory: 'FinanceApplication',
    description: 'Personal finance management platform with comprehensive financial analytics',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DashboardClient />
    </>
  )
}
