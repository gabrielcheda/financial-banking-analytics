import type { Metadata } from 'next'
import BillsClient from './BillsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Bills | BankDash',
  description: 'Track and manage your bills and payments, never miss a due date',
  alternates: {
    canonical: `${baseUrl}/bills`,
  },
  openGraph: {
    title: 'Bills | BankDash',
    description: 'Track and manage your bills and payments, never miss a due date',
    url: `${baseUrl}/bills`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bills | BankDash',
    description: 'Track and manage your bills and payments, never miss a due date',
  },
}

export default function BillsPage() {
  return <BillsClient />
}
