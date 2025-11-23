import type { Metadata } from 'next'
import { Suspense } from 'react'
import MerchantsClient from './MerchantsClient'
import { Skeleton } from '@/components/ui/Skeleton'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Merchants | BankDash',
  description: 'Manage and track your favorite merchants and stores',
  alternates: {
    canonical: `${baseUrl}/merchants`,
  },
  openGraph: {
    title: 'Merchants | BankDash',
    description: 'Manage and track your favorite merchants and stores',
    url: `${baseUrl}/merchants`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merchants | BankDash',
    description: 'Manage and track your favorite merchants and stores',
  },
}

export default function MerchantsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <MerchantsClient />
    </Suspense>
  )
}
