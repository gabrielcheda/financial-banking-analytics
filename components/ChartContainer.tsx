'use client'

import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export const ChartContainer = memo(function ChartContainer({
  title,
  description,
  children,
  action
}: ChartContainerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
})
