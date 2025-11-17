import { Suspense } from 'react'
import MerchantsClient from './MerchantsClient'
import { Skeleton } from '@/components/ui/Skeleton'

export default function MerchantsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <MerchantsClient />
    </Suspense>
  )
}
