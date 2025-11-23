import type { Metadata } from 'next'
import BudgetsClient from './BudgetsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Budgets | BankDash',
  description: 'Manage your budgets, set spending limits, and track your progress toward financial goals',
  alternates: {
    canonical: `${baseUrl}/budgets`,
  },
  openGraph: {
    title: 'Budgets | BankDash',
    description: 'Manage your budgets, set spending limits, and track your progress toward financial goals',
    url: `${baseUrl}/budgets`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budgets | BankDash',
    description: 'Manage your budgets, set spending limits, and track your progress toward financial goals',
  },
}

export default async function BudgetsPage() {
  return <BudgetsClient />
}
