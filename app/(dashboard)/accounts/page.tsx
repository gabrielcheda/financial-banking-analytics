import type { Metadata } from 'next'
import AccountsClient from './AccountsClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Accounts | BankDash',
  description: 'Manage your financial accounts, track balances, and monitor account activity',
  alternates: {
    canonical: `${baseUrl}/accounts`,
  },
  openGraph: {
    title: 'Accounts | BankDash',
    description: 'Manage your financial accounts, track balances, and monitor account activity',
    url: `${baseUrl}/accounts`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accounts | BankDash',
    description: 'Manage your financial accounts, track balances, and monitor account activity',
  },
}

export default async function AccountsPage() {
  return <AccountsClient />
}
