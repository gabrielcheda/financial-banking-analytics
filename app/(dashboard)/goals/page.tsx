import type { Metadata } from 'next'
import GoalsClient from './GoalsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Goals | BankDash',
  description: 'Set and track your financial goals, monitor progress, and achieve your savings targets',
  alternates: {
    canonical: `${baseUrl}/goals`,
  },
  openGraph: {
    title: 'Goals | BankDash',
    description: 'Set and track your financial goals, monitor progress, and achieve your savings targets',
    url: `${baseUrl}/goals`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goals | BankDash',
    description: 'Set and track your financial goals, monitor progress, and achieve your savings targets',
  },
}

export default function GoalsPage() {
  return <GoalsClient />
}
