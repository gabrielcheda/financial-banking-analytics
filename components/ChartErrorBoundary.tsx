'use client'

import React, { Component, ReactNode } from 'react'
import { BarChart3, AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  chartName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary for chart components
 * Provides graceful degradation when chart rendering fails
 */
export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error Boundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">
              {this.props.chartName ? `${this.props.chartName} Unavailable` : 'Chart Unavailable'}
            </h3>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              Unable to display chart data at this time.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
