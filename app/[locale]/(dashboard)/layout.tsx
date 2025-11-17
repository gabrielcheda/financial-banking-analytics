import { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={<div className="lg:w-64" />}>
        <Sidebar />
      </Suspense>

      <div className="lg:pl-64">
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
