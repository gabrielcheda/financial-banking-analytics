/**
 * Analytics Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import type { Metadata } from 'next'
import AnalyticsClient from './AnalyticsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Analytics | BankDash',
  description: 'Visualize your financial data with comprehensive analytics and insights',
  alternates: {
    canonical: `${baseUrl}/analytics`,
  },
  openGraph: {
    title: 'Analytics | BankDash',
    description: 'Visualize your financial data with comprehensive analytics and insights',
    url: `${baseUrl}/analytics`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analytics | BankDash',
    description: 'Visualize your financial data with comprehensive analytics and insights',
  },
}

export default async function AnalyticsPage() {
  return <AnalyticsClient />
}
