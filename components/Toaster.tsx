'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from './ThemeProvider'

export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      theme={theme === 'dark' ? 'dark' : 'light'}
      toastOptions={{
        style: {
          background: theme === 'dark' ? 'hsl(var(--card))' : 'white',
          color: theme === 'dark' ? 'hsl(var(--card-foreground))' : 'black',
          border: `1px solid ${theme === 'dark' ? 'hsl(var(--border))' : '#e5e7eb'}`,
        },
        className: 'rounded-lg shadow-lg',
      }}
    />
  )
}
