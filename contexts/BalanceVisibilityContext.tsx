'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useProfile, useUpdatePreferences } from '@/hooks/useUser'
import { useErrorTranslation } from '@/hooks/useErrorTranslation'
import { toast } from 'sonner'

interface BalanceVisibilityContextValue {
  shouldShowBalance: boolean
  isLoading: boolean
  toggleBalanceVisibility: () => void
  isToggling: boolean
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextValue | undefined>(undefined)

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useProfile()
  const updatePreferences = useUpdatePreferences()
  const { translateError } = useErrorTranslation()
  
  const shouldShowBalance = profile?.preferences?.privacy?.showBalance ?? true

  const toggleBalanceVisibility = async () => {
    try {
      await updatePreferences.mutateAsync({
        privacy: {
          showBalance: !shouldShowBalance,
        },
      })
    } catch (error: any) {
      toast.error(translateError(error?.message))
    }
  }

  return (
    <BalanceVisibilityContext.Provider 
      value={{ 
        shouldShowBalance, 
        isLoading,
        toggleBalanceVisibility,
        isToggling: updatePreferences.isPending,
      }}
    >
      {children}
    </BalanceVisibilityContext.Provider>
  )
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext)
  
  if (context === undefined) {
    throw new Error('useBalanceVisibility must be used within BalanceVisibilityProvider')
  }
  
  return context
}
