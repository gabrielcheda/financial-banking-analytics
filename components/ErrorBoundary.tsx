'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // TODO: Send to error tracking service (Sentry, LogRocket, etc)
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry or other service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="text-center max-w-md">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                  <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Don't worry, we've been notified and we're working on it.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                  }}
                  variant="ghost"
                >
                  Try Again
                </Button>

                <Button
                  onClick={() => {
                    window.location.href = '/dashboard'
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
