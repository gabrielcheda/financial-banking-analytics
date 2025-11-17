import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import NotificationsClient from './NotificationsClient'

export const metadata = {
  title: 'Notifications - BankDash',
  description: 'View and manage your notifications',
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsPageSkeleton />}>
      <NotificationsClient />
    </Suspense>
  )
}

function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
