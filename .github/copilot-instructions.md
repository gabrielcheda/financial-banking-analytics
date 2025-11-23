# AI Coding Agent Instructions - Financial Banking Analytics

## Project Overview

**BankDash** is a Next.js 14 (App Router) personal finance platform with TypeScript, React Query, and Zustand. The frontend consumes a NestJS backend API via an internal proxy (`/api/internal/**` → backend). Features include transactions, budgets, bills, goals, analytics, and settings management.

## Architecture

### Frontend Stack
- **Next.js 14** with App Router (Server Components + Client Components)
- **React Query 5** for server state (caching, optimistic updates, auto-refresh)
- **Zustand** for lightweight client state (filters, UI preferences)
- **Axios** singleton (`services/api/client.ts`) with token refresh interceptors
- **Zod + React Hook Form** for all form validation
- **Tailwind CSS** with dark mode support via `next-themes`
- **Framer Motion** for animations, **Recharts** for charts

### Data Flow Pattern
```
UI Component → React Query Hook → Service Layer → Axios Client → /api/internal/** → Backend API
```

**Key Files:**
- `services/api/client.ts` - Axios instance with auth interceptors, CSRF protection
- `lib/queryClient.ts` - React Query config + hierarchical query keys
- `hooks/use*.tsx` - Domain-specific React Query hooks
- `types/dto.ts` - Shared TypeScript DTOs (matches backend)

## Critical Conventions

### 1. Authentication Flow
- **Tokens**: JWT stored in httpOnly cookies (`accessToken`, `refreshToken`)
- **Client access**: Public token in `accessTokenPublic` cookie + localStorage fallback
- **Refresh**: Automatic via `client.ts` interceptor on 401 → retry original request
- **Middleware**: `middleware.ts` protects routes, generates CSRF tokens
- **Route groups**: `(auth)/*` public, `(dashboard)/*` protected

### 2. API Service Pattern
**All backend calls use singleton service classes:**
```typescript
// services/api/[resource].service.ts
class ResourceService {
  async getAll(filters) { return apiClient.get('/resource', { params: filters }) }
  async create(data) { return apiClient.post('/resource', data) }
  // ...
}
export const resourceService = new ResourceService()
```

**Never call `apiClient` directly from components.** Always use the service layer.

### 3. React Query Hooks Pattern
```typescript
// hooks/useResource.tsx
export const resourceKeys = {
  all: ['resource'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (filters) => [...resourceKeys.lists(), filters] as const,
  detail: (id) => [...resourceKeys.all, 'detail', id] as const,
}

export function useResources(filters) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: () => resourceService.getAll(filters),
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => resourceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      // Invalidate dependent queries (accounts, analytics, budgets, etc.)
      toast.success('Created successfully')
    },
  })
}
```

**Cross-Invalidation**: Mutations invalidate all related query keys (see `hooks/useTransactions.tsx` → `invalidateTransactionDependencies` for the pattern).

### 4. Form Validation
**All forms use React Hook Form + Zod:**
```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { schema } from '@/lib/validations/[resource]'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange', // Real-time validation
})
```

**Common patterns:**
- `parseLocaleNumber` for currency inputs (handles "1.234,56" and "1,234.56")
- `Controller` for date inputs and complex fields
- Conditional validation based on `transactionType` (see `TransactionForm.tsx`)

### 5. Component Organization
```
components/
  ui/          → Reusable primitives (Button, Card, Modal)
  forms/       → Domain forms (TransactionForm, BudgetForm)
  animations/  → Framer Motion wrappers (FadeIn, SlideIn)
  charts/      → Recharts-based visualizations
```

**Server Components by default.** Add `'use client'` only when needed (forms, animations, client hooks).

### 6. Error Handling
```typescript
// lib/error-utils.ts
showErrorToast(error, 'Failed to Create Resource')
```

**Backend errors:**
- NestJS returns `{ statusCode, error, message: string | string[], timestamp, path, requestId }`
- `client.ts` normalizes to `NormalizedError` with `message` (first) + `messages[]` (all)
- Display first message in toast, optionally show all in UI

### 7. State Management Decisions
- **Server state**: React Query (transactions, accounts, budgets, etc.)
- **UI state**: Zustand persisted (`lib/store.ts` for filters, selected account, date range)
- **Form state**: React Hook Form (ephemeral, validation-heavy)

**Never duplicate server data in Zustand.** Query cache is the single source of truth.

## Development Workflows

### Running the App
```bash
npm run dev          # Next.js dev server on :3001
npm run build        # Production build
npm run type-check   # TypeScript validation without emit
npm test             # Vitest tests
npm run test:ui      # Vitest UI
```

**Environment Setup:**
- Copy `.env.local` template from README
- Backend must be running on `http://localhost:3000` (or set `NEXT_PUBLIC_API_URL`)

### Testing
- **Vitest** with `@testing-library/react` and `jsdom`
- Config: `vitest.config.ts` (alias `@` → project root)
- Setup: `tests/setup.ts` (globals, DOM matchers)
- **Write tests for:** utility functions, hooks, pure components
- **Skip for now:** Forms (heavy validation logic), Server Components

### Common Tasks

**Add a new resource (e.g., "tags"):**
1. Add DTOs to `types/dto.ts`
2. Create `services/api/tags.service.ts` (singleton pattern)
3. Create `hooks/useTags.tsx` (query keys + hooks)
4. Create `components/forms/TagForm.tsx` (Zod schema in `lib/validations/tag.ts`)
5. Create page in `app/(dashboard)/tags/page.tsx`
6. Add to sidebar in `components/Sidebar.tsx`

**Update existing API integration:**
1. Update DTO in `types/dto.ts`
2. Update service method in `services/api/*.service.ts`
3. Update hook in `hooks/use*.tsx` (add invalidations if needed)
4. Update form schema in `lib/validations/*.ts`

## Key Integration Points

### Backend API Proxy
- **Path**: `/api/internal/**` in Next.js routes to `${NEXT_PUBLIC_BACKEND_API_URL}` (default: `http://localhost:3001/api/v1`)
- **CSRF**: `middleware.ts` generates tokens, `client.ts` sends in `X-CSRF-Token` header
- **Cookies**: Forwarded automatically (httpOnly tokens managed server-side)

### Query Key Hierarchy
```typescript
// lib/queryClient.ts
queryKeys.transactions.all                     // ['transactions']
queryKeys.transactions.list({ accountId })     // ['transactions', 'list', { accountId }]
queryKeys.transactions.detail(id)              // ['transactions', 'detail', id]
```

**Invalidation strategy**: Invalidate parent keys to refetch all children (e.g., `invalidateQueries({ queryKey: queryKeys.transactions.all })` refetches lists + details).

### Form-to-API Flow
1. User submits form → `handleSubmit` validates via Zod
2. `onSubmit` calls mutation hook (e.g., `useCreateTransaction()`)
3. Mutation calls service (e.g., `transactionService.create(data)`)
4. Service calls `apiClient.post('/transactions', data)`
5. `onSuccess` invalidates queries + shows toast
6. React Query refetches affected data automatically

## Styling & UI

- **Tailwind utilities**: Use `dark:` variants for dark mode (managed by `ThemeProvider`)
- **Color palette**: Primary blue (`blue-500`), green (income), red (expense)
- **Animations**: Wrap in `<FadeIn>`, `<SlideIn>`, or `<StaggerChildren>` from `components/animations/`
- **Icons**: Lucide React (`lucide-react`) - import as needed

## Performance Considerations

- **Virtual scrolling**: Use `@tanstack/react-virtual` for large lists (see `VirtualTransactionList.tsx`)
- **Code splitting**: Next.js auto-splits routes; manual chunks in `next.config.js` for Recharts, React Query, Framer Motion
- **React Query stale time**: 5 min default (see `lib/queryClient.ts`)
- **Optimistic updates**: Implemented in mutations for instant UI feedback (see budget/goal hooks)

## Known Patterns & Quirks

- **Transaction type logic**: Forms dynamically filter categories (income/expense) and show/hide `toAccountId` (transfer)
- **Merchant-Category linking**: Merchants are filtered by selected category in forms
- **Number parsing**: Use `parseLocaleNumber` from `lib/numberUtils.ts` for currency inputs (handles comma/period separators)
- **Date handling**: `date-fns` for formatting, always store ISO strings in backend
- **Toast notifications**: `sonner` library, use `toast.success()` / `toast.error()` (see `components/Toaster.tsx`)

## External Dependencies

- **Backend API**: NestJS on port 3000 (see `BACKEND_API.md` for endpoints)
- **Database**: PostgreSQL via backend (Supabase in production)
- **Chart library**: Recharts (heavy bundle, code-split in `next.config.js`)

## When in Doubt

1. **Check existing patterns**: Look at `useTransactions.tsx`, `TransactionForm.tsx`, `transactions.service.ts` for the canonical implementation
2. **DTO alignment**: Always match backend DTOs in `types/dto.ts`
3. **Query invalidation**: Over-invalidate rather than under (stale data is worse than extra requests)
4. **Error handling**: Use `showErrorToast` from `lib/error-utils.ts`
5. **Accessibility**: Forms need labels, error messages, ARIA attributes (see existing forms)

---

**Last Updated**: November 2025  
**Project Version**: 0.3.0
