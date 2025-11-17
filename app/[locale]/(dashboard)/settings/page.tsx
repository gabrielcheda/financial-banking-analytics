import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import SettingsClient from './SettingsClient'

export const metadata = {
  title: 'Settings - BankDash',
  description: 'Manage your profile and preferences',
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsClient />
    </Suspense>
  )
}

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}
