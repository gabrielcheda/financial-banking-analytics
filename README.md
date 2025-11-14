# BankDash - Personal Finance Management Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React Query](https://img.shields.io/badge/React_Query-5.28-FF4154?style=for-the-badge&logo=react-query)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern, full-stack personal finance management application with comprehensive financial analytics, budgeting tools, and real-time data synchronization.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Documentation](#-api-integration)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [API Integration](#-api-integration)
- [Authentication](#-authentication)
- [State Management](#-state-management)
- [Performance](#-performance-optimizations)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## Overview

**BankDash** is a comprehensive personal finance management platform that helps users track expenses, manage budgets, set financial goals, and gain insights into their spending habits. Built with Next.js 14 (App Router) and TypeScript, it features a beautiful, responsive UI and integrates with a robust NestJS backend.

### 🎯 Key Highlights

- **Full-Stack Integration**: Seamlessly connected with NestJS backend API
- **Real-Time Sync**: Automatic data synchronization with PostgreSQL (Supabase)
- **Modern Architecture**: Server Components, Server Actions, and API Routes
- **Type-Safe**: End-to-end TypeScript with shared DTOs
- **Production-Ready**: Optimized for performance and scalability

---

## ✨ Features

### 💰 Financial Management

- **Multi-Account Support**: Manage checking, savings, credit cards, and investment accounts
- **Transaction Tracking**: Create, edit, and categorize transactions with advanced filtering
- **Budget Management**: Set monthly budgets per category with real-time progress tracking
- **Bill Tracking**: Never miss a payment with bill reminders and payment history
- **Financial Goals**: Set savings goals and track progress with automatic calculations
- **Analytics Dashboard**: Visualize spending patterns with interactive charts

### 📊 Analytics & Insights

- **Spending Analysis**: Breakdown by category, merchant, and time period
- **Trends**: Identify spending patterns and seasonal variations
- **Cash Flow**: Monitor income vs expenses with predictive analytics
- **Category Insights**: Deep dive into spending habits per category
- **Comparative Reports**: Month-over-month and year-over-year comparisons
- **Financial Health Score**: AI-powered insights (coming soon)

### 🔐 Security & Auth

- **JWT Authentication**: Secure token-based authentication
- **Automatic Token Refresh**: Seamless session management
- **HTTP-Only Cookies**: Enhanced security for sensitive data
- **Protected Routes**: Server-side and client-side route protection
- **Password Reset**: Secure password recovery flow

### 🎨 User Experience

- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Mobile-first approach, works on all devices
- **Animations**: Smooth transitions with Framer Motion
- **Virtual Scrolling**: Optimized performance for large transaction lists
- **Loading States**: Skeleton loaders and suspense boundaries
- **Error Handling**: Comprehensive error boundaries and toast notifications

---

## 🛠 Tech Stack

### Frontend Core

- **[Next.js 14.2](https://nextjs.org/)** - React framework with App Router
- **[React 18.3](https://react.dev/)** - UI library with Server Components
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework

### Data Fetching & State

- **[@tanstack/react-query 5.28](https://tanstack.com/query)** - Server state management
  - Automatic caching and background refetching
  - Optimistic updates
  - Pagination and infinite scroll support
- **[Zustand 5.0](https://zustand-demo.pmnd.rs/)** - Lightweight client state
- **[Axios 1.6](https://axios-http.com/)** - HTTP client with interceptors

### UI & Visualization

- **[Recharts 3.3](https://recharts.org/)** - Chart library for analytics
- **[Framer Motion 11.0](https://www.framer.com/motion/)** - Animation library
- **[Lucide React 0.552](https://lucide.dev/)** - Icon library
- **[Sonner 1.4](https://sonner.emilkowal.ski/)** - Toast notifications
- **[@tanstack/react-virtual 3.2](https://tanstack.com/virtual)** - Virtual scrolling

### Forms & Validation

- **[React Hook Form 7.51](https://react-hook-form.com/)** - Form management
- **[Zod 3.22](https://zod.dev/)** - Schema validation
- **[@hookform/resolvers 3.3](https://github.com/react-hook-form/resolvers)** - Form validation integration

### Date & Utilities

- **[date-fns 4.1](https://date-fns.org/)** - Date manipulation and formatting

### Development & Testing

- **[Vitest 1.3](https://vitest.dev/)** - Unit testing framework
- **[@testing-library/react 14.2](https://testing-library.com/)** - Component testing
- **[TypeScript ESLint](https://typescript-eslint.io/)** - Linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher
- **Backend**: NestJS API running on port 3000 ([Backend Repo](../personal-finance/backend))

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Financial-banking-analytics
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

Create a `.env.local` file in the root directory:

```env
# API Configuration - NestJS Backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=BankDash

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=false
NEXT_PUBLIC_ENABLE_BANK_SYNC=false
NEXT_PUBLIC_ENABLE_MULTI_CURRENCY=false
NEXT_PUBLIC_ENABLE_REAL_TIME=false

# Development
NODE_ENV=development
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001)

### Test Credentials

```
Email: demo@example.com
Password: Demo@12345
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server on port 3001
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types

# Testing
npm test                 # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

---

## 📁 Project Structure

```
Financial-banking-analytics/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (route group)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── register/
│   │   │   └── page.tsx          # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Password recovery
│   │   └── layout.tsx            # Auth layout
│   │
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── transactions/         # Transaction management
│   │   ├── accounts/             # Account management
│   │   ├── budgets/              # Budget planning
│   │   ├── bills/                # Bill tracking
│   │   ├── goals/                # Financial goals
│   │   ├── analytics/            # Analytics & insights
│   │   ├── reports/              # Report generation
│   │   ├── planning/             # Financial planning tools
│   │   └── layout.tsx            # Dashboard layout (Sidebar, Header)
│   │
│   ├── actions/                  # Server Actions
│   │   └── auth.ts               # Authentication actions
│   │
│   ├── api/                      # API Routes
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── register/route.ts
│   │       └── logout/route.ts
│   │
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects to dashboard)
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Skeleton.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── AccountForm.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── BudgetForm.tsx
│   │   └── GoalForm.tsx
│   │
│   ├── animations/               # Animation wrappers
│   │   ├── FadeIn.tsx
│   │   ├── SlideIn.tsx
│   │   ├── ScaleIn.tsx
│   │   └── StaggerChildren.tsx
│   │
│   ├── Header.tsx                # Top navigation
│   ├── Sidebar.tsx               # Side navigation
│   ├── StatCard.tsx              # Statistics card
│   ├── TransactionCard.tsx       # Transaction list item
│   ├── ChartContainer.tsx        # Chart wrapper
│   ├── VirtualTransactionList.tsx # Optimized transaction list
│   ├── EmptyState.tsx            # Empty state placeholder
│   ├── ErrorBoundary.tsx         # Error boundary
│   ├── ThemeProvider.tsx         # Dark mode provider
│   ├── QueryProvider.tsx         # React Query provider
│   └── Toaster.tsx               # Toast notifications
│
├── services/                     # API service layer
│   └── api/
│       ├── client.ts             # Axios instance with interceptors
│       ├── auth.service.ts       # Authentication API
│       ├── accounts.service.ts   # Accounts CRUD
│       ├── transactions.service.ts # Transactions CRUD
│       ├── budgets.service.ts    # Budgets CRUD
│       ├── bills.service.ts      # Bills CRUD
│       ├── goals.service.ts      # Goals CRUD
│       ├── categories.service.ts # Categories CRUD
│       └── analytics.service.ts  # Analytics & insights
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hooks
│   ├── useAccounts.ts            # Account queries/mutations
│   ├── useTransactions.ts        # Transaction queries/mutations
│   ├── useBudgets.ts             # Budget queries/mutations
│   ├── useBills.ts               # Bill queries/mutations
│   ├── useGoals.ts               # Goal queries/mutations
│   ├── useCategories.ts          # Category queries/mutations
│   ├── useAnalytics.ts           # Analytics queries
│   └── useDebounce.ts            # Debounce utility hook
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Domain models
│   └── dto.ts                    # Data Transfer Objects (shared with backend)
│
├── lib/                          # Utilities and configurations
│   ├── queryClient.ts            # React Query configuration
│   ├── store.ts                  # Zustand store
│   ├── featureFlags.ts           # Feature flags
│   ├── validations/              # Zod schemas
│   │   ├── auth.ts
│   │   ├── account.ts
│   │   └── transaction.ts
│   └── utils.ts                  # Utility functions
│
├── utils/                        # Helper utilities
│   ├── currency.ts               # Currency formatting
│   └── date.ts                   # Date formatting
│
├── middleware.ts                 # Next.js middleware (auth check)
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest configuration
├── .env.local                    # Environment variables
└── package.json                  # Dependencies and scripts
```

---

## 🏗 Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (Port 3001)              │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   UI Layer   │  │ Server       │  │   Server    │ │ │
│  │  │ (Components) │  │ Components   │  │   Actions   │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │ │
│  │         │                 │                  │        │ │
│  │         └─────────────────┴──────────────────┘        │ │
│  │                           │                           │ │
│  │         ┌─────────────────┴──────────────────┐       │ │
│  │         │                                     │       │ │
│  │  ┌──────▼────────┐              ┌───────────▼────┐  │ │
│  │  │  React Query  │              │  Service Layer │  │ │
│  │  │  (TanStack)   │◄─────────────┤   (Axios)      │  │ │
│  │  └───────────────┘              └────────┬───────┘  │ │
│  │                                           │          │ │
│  └───────────────────────────────────────────┼──────────┘ │
│                                              │            │
└──────────────────────────────────────────────┼────────────┘
                                               │
                                    HTTP/REST  │
                                               │
┌──────────────────────────────────────────────▼────────────┐
│                    NestJS Backend (Port 3000)             │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   API Layer                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐ │  │
│  │  │Controllers │  │  Services  │  │ Repositories│ │  │
│  │  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘ │  │
│  │        │                │                │        │  │
│  │        └────────────────┴────────────────┘        │  │
│  │                         │                         │  │
│  └─────────────────────────┼─────────────────────────┘  │
│                            │                            │
│  ┌─────────────────────────▼─────────────────────────┐  │
│  │               TypeORM / PostgreSQL                │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────┬───────────────────┘
                                        │
                                        │ SQL/TCP
                                        │
┌───────────────────────────────────────▼───────────────────┐
│                   Supabase PostgreSQL                     │
│                    (Cloud Database)                       │
└───────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → UI Component
2. **Component** → React Query Hook
3. **Hook** → Service Layer (Axios)
4. **Service** → Backend API (NestJS)
5. **Backend** → TypeORM → PostgreSQL
6. **Response** → Service → Hook → Component → UI

### Authentication Flow

```
1. User submits login form
2. Frontend calls auth.service.login()
3. Service sends POST /api/v1/auth/login
4. Backend validates credentials
5. Backend returns { user, accessToken, refreshToken }
6. Frontend stores tokens in:
   - localStorage (client-side access)
   - HTTP-only cookies (server-side access)
7. Subsequent requests include Authorization: Bearer <token>
8. On 401 error, automatic token refresh is triggered
9. If refresh fails, redirect to /login
```

---

## 🔌 API Integration

### API Client Configuration

The application uses a singleton Axios instance with interceptors for authentication and error handling:

```typescript
// services/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshed = await refreshToken()
      if (refreshed) {
        // Retry original request
        return apiClient(error.config)
      }
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Service Layer Pattern

All API calls go through dedicated service modules:

```typescript
// services/api/transactions.service.ts
class TransactionsService {
  async getAll(filters: TransactionFiltersDTO): Promise<TransactionDTO[]> {
    const response = await apiClient.get('/transactions', { params: filters })
    return response.data
  }

  async create(data: CreateTransactionDTO): Promise<TransactionDTO> {
    const response = await apiClient.post('/transactions', data)
    return response.data
  }

  // ... other methods
}

export const transactionsService = TransactionsService.getInstance()
```

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Authentication** |
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Get current user |
| **Accounts** |
| GET | `/accounts` | List all accounts |
| GET | `/accounts/:id` | Get account by ID |
| POST | `/accounts` | Create new account |
| PATCH | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |
| POST | `/accounts/transfer` | Transfer between accounts |
| GET | `/accounts/:id/balance-history` | Get balance history |
| **Transactions** |
| GET | `/transactions` | List transactions (with filters) |
| GET | `/transactions/:id` | Get transaction by ID |
| POST | `/transactions` | Create transaction |
| PATCH | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| POST | `/transactions/import` | Import transactions (CSV/OFX) |
| POST | `/transactions/export` | Export transactions |
| GET | `/transactions/stats` | Get transaction statistics |
| **Budgets** |
| GET | `/budgets` | List all budgets |
| GET | `/budgets/:id` | Get budget by ID |
| POST | `/budgets` | Create budget |
| PATCH | `/budgets/:id` | Update budget |
| DELETE | `/budgets/:id` | Delete budget |
| GET | `/budgets/:id/progress` | Get budget progress |
| **Bills** |
| GET | `/bills` | List all bills |
| GET | `/bills/:id` | Get bill by ID |
| POST | `/bills` | Create bill |
| PATCH | `/bills/:id` | Update bill |
| DELETE | `/bills/:id` | Delete bill |
| POST | `/bills/:id/pay` | Mark bill as paid |
| GET | `/bills/upcoming` | Get upcoming bills |
| **Goals** |
| GET | `/goals` | List all goals |
| GET | `/goals/:id` | Get goal by ID |
| POST | `/goals` | Create goal |
| PATCH | `/goals/:id` | Update goal |
| DELETE | `/goals/:id` | Delete goal |
| POST | `/goals/:id/contribute` | Add contribution to goal |
| **Categories** |
| GET | `/categories` | List all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| GET | `/categories/spending` | Get spending by category |
| **Analytics** |
| GET | `/analytics/overview` | Get financial overview |
| GET | `/analytics/cash-flow` | Get cash flow analysis |
| GET | `/analytics/trends` | Get spending trends |
| GET | `/analytics/spending-by-category` | Category breakdown |

---

## 🔐 Authentication

### JWT Token Management

The application uses JWT tokens for authentication:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### Token Storage

- **localStorage**: For client-side JavaScript access
- **HTTP-only Cookies**: For server-side rendering and enhanced security

### Protected Routes

Routes are protected using Next.js middleware:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')

  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## 🎯 State Management

### Server State - React Query

React Query handles all server state with automatic caching, background refetching, and optimistic updates.

#### Configuration

```typescript
// lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
})
```

#### Query Keys Structure

```typescript
// Hierarchical query keys for efficient cache management
const queryKeys = {
  auth: ['auth'] as const,
  user: () => [...queryKeys.auth, 'user'] as const,

  accounts: ['accounts'] as const,
  accountList: () => [...queryKeys.accounts, 'list'] as const,
  accountDetail: (id: string) => [...queryKeys.accounts, 'detail', id] as const,

  transactions: ['transactions'] as const,
  transactionList: (filters: any) =>
    [...queryKeys.transactions, 'list', filters] as const,
  transactionDetail: (id: string) =>
    [...queryKeys.transactions, 'detail', id] as const,
}
```

#### Usage Example

```typescript
// hooks/useTransactions.ts
export function useTransactions(filters: TransactionFiltersDTO) {
  return useQuery({
    queryKey: queryKeys.transactionList(filters),
    queryFn: () => transactionsService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      transactionsService.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions
      })
      toast.success('Transaction created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
```

### Client State - Zustand

Lightweight client-side state for UI preferences and filters:

```typescript
// lib/store.ts
interface FilterState {
  selectedAccount: string | null
  dateRange: { start: Date; end: Date }
  selectedCategories: string[]
  searchQuery: string
  setSelectedAccount: (id: string | null) => void
  setDateRange: (range: { start: Date; end: Date }) => void
  // ... other actions
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      selectedAccount: null,
      dateRange: { start: startOfMonth(new Date()), end: new Date() },
      selectedCategories: [],
      searchQuery: '',
      setSelectedAccount: (id) => set({ selectedAccount: id }),
      setDateRange: (range) => set({ dateRange: range }),
      // ... other implementations
    }),
    { name: 'filter-storage' }
  )
)
```

---

## ⚡ Performance Optimizations

### Server Components

Most pages use React Server Components for optimal performance:

```typescript
// app/(dashboard)/dashboard/page.tsx - Server Component
export default async function DashboardPage() {
  // Data fetching happens on the server
  // No JavaScript sent to the client for this component
  return (
    <div>
      <DashboardStats /> {/* Server Component */}
      <RecentTransactions /> {/* Server Component */}
      <InteractiveChart /> {/* 'use client' - Client Component */}
    </div>
  )
}
```

### Code Splitting

Webpack is configured for optimal bundle splitting:

```javascript
// next.config.js
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        recharts: {
          test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
          name: 'recharts',
          priority: 20,
        },
        reactQuery: {
          test: /[\\/]node_modules[\\/](@tanstack[\\/]react-query)[\\/]/,
          name: 'react-query',
          priority: 15,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
        },
      },
    }
  }
  return config
}
```

### Virtual Scrolling

Large transaction lists use virtual scrolling for optimal performance:

```typescript
// components/VirtualTransactionList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualTransactionList({ transactions }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <TransactionCard
            key={virtualItem.key}
            transaction={transactions[virtualItem.index]}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

### Image Optimization

Next.js Image component with optimal configuration:

```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### Production Optimizations

- **SWC Minification**: Faster than Terser
- **Tree Shaking**: Remove unused code
- **Console Log Removal**: Automatically removed in production
- **Source Maps**: Disabled in production for smaller bundle size

---

## 🚢 Deployment

### Prerequisites

- Backend API deployed and accessible
- PostgreSQL database (Supabase recommended)
- Environment variables configured

### Vercel Deployment (Recommended)

1. **Connect Repository**

```bash
vercel
```

2. **Configure Environment Variables**

Add all `.env.local` variables to Vercel project settings:

- `NEXT_PUBLIC_API_URL`
- `API_URL`
- `NEXT_PUBLIC_APP_URL`
- Other feature flags

3. **Deploy**

```bash
vercel --prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t bankdash-frontend .
docker run -p 3001:3001 bankdash-frontend
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `API_URL` | Backend API URL (server-side) | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | Yes |
| `NEXT_PUBLIC_API_TIMEOUT` | API timeout in milliseconds | No |
| `NEXT_PUBLIC_ENABLE_AI_INSIGHTS` | Enable AI features | No |
| `NEXT_PUBLIC_ENABLE_BANK_SYNC` | Enable bank synchronization | No |

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

### Example Test

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Recharts](https://recharts.org/) - Chart library
- [Lucide](https://lucide.dev/) - Beautiful icons

---

## 📞 Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Contact the maintainers
- Check the [documentation](./docs)

---

## 🗺 Roadmap

- [ ] AI-powered insights and recommendations
- [ ] Real-time notifications with WebSockets
- [ ] Multi-currency support
- [ ] Bank account integration (Plaid)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting (PDF generation)
- [ ] Receipt OCR scanning
- [ ] Collaborative budgets
- [ ] Tax optimization tools
- [ ] Investment tracking

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

[⬆ Back to Top](#bankdash---personal-finance-management-platform)

</div>
