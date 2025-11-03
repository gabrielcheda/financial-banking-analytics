import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
  selectedAccount: string | null
  dateRange: {
    start: Date | null
    end: Date | null
  }
  selectedCategories: string[]
  searchQuery: string
}

interface AppState extends FilterState {
  setSelectedAccount: (accountId: string | null) => void
  setDateRange: (start: Date | null, end: Date | null) => void
  setSelectedCategories: (categories: string[]) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

const initialState: FilterState = {
  selectedAccount: null,
  dateRange: {
    start: null,
    end: null,
  },
  selectedCategories: [],
  searchQuery: '',
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedAccount: (accountId) => set({ selectedAccount: accountId }),
      setDateRange: (start, end) => set({ dateRange: { start, end } }),
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      resetFilters: () => set(initialState),
    }),
    {
      name: 'banking-dashboard-storage',
    }
  )
)
