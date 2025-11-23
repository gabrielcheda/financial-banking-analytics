/**
 * Planning Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import type { Metadata } from 'next'
import PlanningClient from './PlanningClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Planning | BankDash',
  description: 'Plan your financial future with budgets, goals, and forecasting tools',
  alternates: {
    canonical: `${baseUrl}/planning`,
  },
  openGraph: {
    title: 'Planning | BankDash',
    description: 'Plan your financial future with budgets, goals, and forecasting tools',
    url: `${baseUrl}/planning`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planning | BankDash',
    description: 'Plan your financial future with budgets, goals, and forecasting tools',
  },
}

export default async function PlanningPage() {
  return <PlanningClient />
}
