/**
 * Reports Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import type { Metadata } from 'next'
import ReportsClient from './ReportsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Reports | BankDash',
  description: 'Generate and download detailed financial reports for your accounts',
  alternates: {
    canonical: `${baseUrl}/reports`,
  },
  openGraph: {
    title: 'Reports | BankDash',
    description: 'Generate and download detailed financial reports for your accounts',
    url: `${baseUrl}/reports`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reports | BankDash',
    description: 'Generate and download detailed financial reports for your accounts',
  },
}

export default async function ReportsPage() {
  return <ReportsClient />
}
