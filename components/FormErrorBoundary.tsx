'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { useI18n } from '@/i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  errorTitle?: string
  errorMessage?: string
  resetButtonText?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary for form components
 * Provides user-friendly error messages and reset functionality
 */
class FormErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form Error Boundary caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">{this.props.errorTitle}</h3>
          </div>
          <p className="text-center text-sm text-red-600 dark:text-red-400">
            {this.state.error?.message || this.props.errorMessage}
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm">
            {this.props.resetButtonText}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional wrapper for FormErrorBoundary with i18n support
 */
export function FormErrorBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { t } = useI18n()
  
  return (
    <FormErrorBoundaryClass
      fallback={fallback}
      errorTitle={t('common.formError')}
      errorMessage={t('common.errorLoadingForm')}
      resetButtonText={t('common.tryAgain')}
    >
      {children}
    </FormErrorBoundaryClass>
  )
}
