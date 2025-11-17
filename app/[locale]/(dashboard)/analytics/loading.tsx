import {
  Skeleton,
  SkeletonCard,
  SkeletonChart,
} from '@/components/ui/Skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Period Selector Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart title="Income vs Expenses" />
        <SkeletonChart title="Expense Breakdown" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart title="Spending Trends" />
        <SkeletonChart title="Category Analysis" />
      </div>

      {/* Full Width Chart */}
      <SkeletonChart title="Monthly Overview" />
    </div>
  )
}
