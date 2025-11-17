import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

type HeadingElement = keyof Pick<
  JSX.IntrinsicElements,
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span'
>

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps extends CardProps {
  as?: HeadingElement
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return React.createElement(
    Component,
    { className: `text-base sm:text-lg font-semibold text-gray-900 dark:text-white ${className}` },
    children
  )
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 ${className}`}>
      {children}
    </div>
  )
}
