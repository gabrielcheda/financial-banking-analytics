// DTO (Data Transfer Objects) - Interfaces compartilhadas entre Frontend e Backend

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: {
    timestamp: string
    requestId: string
  }
}

// Formato de erro retornado pelo NestJS
export interface ApiError {
  statusCode: number
  error: string // "Bad Request", "Unauthorized", etc.
  message: string | string[] // Pode ser string única ou array de mensagens de validação
  timestamp: string
  path: string
  requestId: string
}

// Formato normalizado de erro para uso no frontend
export interface NormalizedError {
  message: string
  messages: string[] // Array de mensagens (útil para erros de validação)
  code: string
  status: number
  timestamp?: string
  path?: string
  requestId?: string
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta: {
    timestamp: string
    requestId: string
  }
}

// ============================================================================
// Authentication DTOs
// ============================================================================

export interface LoginDTO {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthTokensDTO {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  preferences: {
    currency?: string
    language?: string
    theme?: string
    dateFormat?: string
    timeFormat?: string
    notifications?: {
      email?: {
        billReminders?: boolean
        budgetAlerts?: boolean
        weeklyReports?: boolean
        monthlyReports?: boolean
      }
      push?: {
        billReminders?: boolean
        budgetAlerts?: boolean
        largeTransactions?: boolean
      }
      reminderTime?: string
    }
    privacy?: {
      showBalance?: boolean
      analyticsConsent?: boolean
    }
  }
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponseDTO {
  user: UserDTO
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export interface RefreshTokenDTO {
  refreshToken: string
}

export interface ForgotPasswordDTO {
  email: string
}

export interface ResetPasswordDTO {
  token: string
  newPassword: string
}

// ============================================================================
// Account DTOs
// ============================================================================

export interface AccountDTO {
  id: string
  userId: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  accountNumber: string | null
  institution: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AccountDetailsDTO extends AccountDTO {
  pendingBalance: number
  routingNumber?: string
  interestRate?: number
  creditLimit?: number
  minimumBalance?: number
  statistics: {
    totalTransactions: number
    averageMonthlyBalance: number
    monthlyIncome: number
    monthlyExpenses: number
  }
}

export interface CreateAccountDTO {
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance?: number
  currency?: string
  accountNumber?: string
  institution?: string
  isActive?: boolean
}

export interface UpdateAccountDTO {
  name?: string
  type?: 'checking' | 'savings' | 'credit' | 'investment'
  balance?: number
  currency?: string
  accountNumber?: string
  institution?: string
  isActive?: boolean
}

export interface AccountSummaryDTO {
  totalBalance: number
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  accountsByType: Record<string, number>
  monthlyChange: {
    amount: number
    percentage: number
  }
}

// ============================================================================
// Transaction DTOs
// ============================================================================

export interface TransactionDTO {
  id: string
  accountId: string
  toAccountId?: string | null
  categoryId: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  status: 'pending' | 'completed' | 'cancelled'
  merchant: string | null
  merchantId: string | null
  merchantEntity?: MerchantDTO
  notes: string | null
  tags: string[] | null
  location: LocationDTO | null
  attachments: AttachmentDTO[] | null
  metadata: {
    source?: string
    ipAddress?: string
    userAgent?: string
  }
  createdAt: string
  updatedAt: string
}

export interface TransactionDetailsDTO extends TransactionDTO {
  account: {
    id: string
    name: string
  }
  metadata: {
    source: 'mobile_app' | 'web' | 'import' | 'automatic'
    ipAddress?: string
    userAgent?: string
  }
}

export interface CreateTransactionDTO {
  accountId: string
  toAccountId?: string
  categoryId: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  status?: 'pending' | 'completed' | 'cancelled'
  merchant?: string
  merchantId?: string
  notes?: string
  tags?: string[]
  attachments?: AttachmentDTO[]
  metadata?: {
    source?: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface UpdateTransactionDTO {
  accountId?: string
  toAccountId?: string
  categoryId?: string
  date?: string
  description?: string
  amount?: number
  type?: 'income' | 'expense' | 'transfer'
  status?: 'pending' | 'completed' | 'cancelled'
  merchant?: string
  merchantId?: string
  notes?: string
  tags?: string[]
  attachments?: AttachmentDTO[]
  metadata?: {
    source?: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface TransactionFiltersDTO {
  dateFrom?: string
  dateTo?: string
  type?: 'income' | 'expense' | 'transfer'
  categoryId?: string
  accountId?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  status?: 'pending' | 'completed' | 'cancelled'
  tags?: string[]
  merchant?: string
  sortBy?: 'date' | 'amount' | 'description' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}

export interface TransactionStatsDTO {
  totalTransactions: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  averageTransaction: number
  largestIncome: number
  largestExpense: number
  byCategory: CategorySpendingDTO[]
  byType: {
    income: {
      count: number
      total: number
      percentage: number
    }
    expense: {
      count: number
      total: number
      percentage: number
    }
  }
  byMonth: MonthlyStatsDTO[]
}

export interface MonthlyStatsDTO {
  month: string
  income: number
  expenses: number
  net: number
}

export interface ImportTransactionsDTO {
  file: File
  accountId: string
  format: 'csv' | 'ofx'
  skipDuplicates: boolean
}

export interface ImportResultDTO {
  imported: number
  skipped: number
  errors: string[]
  duplicates: number
  transactions: TransactionDTO[]
}

// ============================================================================
// Category DTOs
// ============================================================================

export interface CategoryDTO {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string | null
  isCustom: boolean
  isActive: boolean
  userId: string | null
  parentCategoryId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDTO {
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
  parentCategoryId?: string
}

export interface UpdateCategoryDTO {
  name?: string
  type?: 'income' | 'expense'
  color?: string
  icon?: string
  parentCategoryId?: string
}

export interface CategorySpendingDTO {
  category: string
  categoryId: string
  amount: number
  percentage: number
  transactionCount: number
  averageTransaction: number
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    previousPeriod: number
  }
  budget?: {
    limit: number
    remaining: number
    percentageUsed: number
  }
}

// ============================================================================
// Budget DTOs
// ============================================================================

export interface BudgetDTO {
  id: string
  userId: string
  categoryId: string
  limitAmount: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate: string
  alerts: {
    enabled: boolean
    threshold: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetDTO {
  categoryId: string
  limitAmount: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate: string
  alerts?: {
    enabled: boolean
    threshold: number
  }
}

export interface UpdateBudgetDTO {
  categoryId?: string
  limitAmount?: number
  period?: 'monthly' | 'yearly'
  startDate?: string
  endDate?: string
  alerts?: {
    enabled: boolean
    threshold: number
  }
}

// ============================================================================
// Bill DTOs
// ============================================================================

export interface BillDTO {
  id: string
  userId: string
  accountId?: string
  categoryId: string
  merchantId: string
  name: string
  amount: number
  dueDate: string
  recurrence: 'once' | 'weekly' | 'monthly' | 'yearly'
  isPaid: boolean
  paidAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  // Relations
  category?: {
    id: string
    name: string
    color: string
  }
  merchant?: MerchantDTO
  account?: {
    id: string
    name: string
  }
  // Computed fields (only present in specific endpoints)
  daysUntilDue?: number
  daysOverdue?: number
}

export interface CreateBillDTO {
  name: string
  amount: number
  dueDate: string
  recurrence: 'once' | 'weekly' | 'monthly' | 'yearly'
  merchantId: string
  categoryId: string
  accountId: string
  isPaid?: boolean
  notes?: string
}

export interface UpdateBillDTO {
  name?: string
  amount?: number
  dueDate?: string
  recurrence?: 'once' | 'weekly' | 'monthly' | 'yearly'
  merchantId?: string
  categoryId?: string
  accountId?: string
  isPaid?: boolean
  notes?: string
}

export interface PayBillDTO {
  paymentDate?: string // ISO string, defaults to current date/time
  notes?: string
  accountId: string
  amount?: number
}

export interface PayBillResponseDTO {
  id: string
  name: string
  amount: number
  dueDate: string
  isPaid: boolean
  paidAt: string
  notes?: string
  message: string
}

// ============================================================================
// Goal DTOs
// ============================================================================

export interface GoalDTO {
  id: string
  userId: string
  name: string
  description?: string | null
  targetAmount: number
  currentAmount: number
  deadline: string
  categoryId?: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'cancelled'
  linkedAccountId?: string | null
  monthlyContribution?: number | null
  milestones?: MilestoneDTO[] | null
  // Computed fields (calculated automatically)
  progress: number // (currentAmount / targetAmount) * 100
  daysRemaining: number // Difference between deadline and current date
  createdAt: string
  updatedAt: string
  // Relations
  category?: {
    id: string
    name: string
    color: string
  }
}

export interface MilestoneDTO {
  id: string
  amount: number
  isReached: boolean
  reachedDate?: string
}

export interface CreateGoalDTO {
  name: string
  description?: string
  targetAmount: number
  currentAmount?: number
  deadline: string
  categoryId?: string
  priority?: 'low' | 'medium' | 'high'
  linkedAccountId?: string
  monthlyContribution?: number
  milestones?: MilestoneDTO[]
}

export interface UpdateGoalDTO {
  name?: string
  description?: string
  targetAmount?: number
  currentAmount?: number
  deadline?: string
  categoryId?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'active' | 'completed' | 'cancelled'
  linkedAccountId?: string
  monthlyContribution?: number
  milestones?: MilestoneDTO[]
}

export interface ContributeToGoalDTO {
  amount: number // Required, min: 0.01
  notes?: string // Optional
}

export interface ContributeToGoalResponseDTO {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  progress: number
  status: string
  message: string
}

// ============================================================================
// Analytics DTOs
// ============================================================================

export interface AnalyticsOverviewDTO {
  income: {
    total: number
    average: number
    transactions: number
    trend: TrendDTO
  }
  expenses: {
    total: number
    average: number
    transactions: number
    trend: TrendDTO
  }
  savings: {
    total: number
    rate: number
    trend: TrendDTO
  }
  topCategories: CategorySpendingDTO[]
  topMerchants: MerchantSpendingDTO[]
  cashFlow: CashFlowDTO[]
}

export interface TrendDTO {
  direction: 'up' | 'down' | 'stable'
  percentage: number
}

export interface MerchantSpendingDTO {
  merchant: string
  amount: number
  percentage: number
  transactionCount: number
}

export interface CashFlowDTO {
  date: string
  income: number
  expenses: number
  net: number
}

export interface TrendsAnalysisDTO {
  metric: 'spending' | 'income' | 'savings'
  trend: 'increasing' | 'decreasing' | 'stable'
  changeRate: number
  forecast: ForecastDTO[]
  insights: InsightDTO[]
}

export interface ForecastDTO {
  period: string
  predicted: number
  confidence: number
}

export interface InsightDTO {
  type: 'warning' | 'tip' | 'achievement'
  message: string
  category?: string
  impact: 'high' | 'medium' | 'low'
}

// ============================================================================
// Report DTOs
// ============================================================================

export interface GenerateReportDTO {
  type: 'monthly' | 'tax' | 'expense' | 'custom'
  format: 'pdf' | 'csv' | 'excel'
  startDate: string
  endDate: string
  categories?: string[]
  accounts?: string[]
  includeCharts?: boolean
  includeTransactionDetails?: boolean
}

export interface ReportDTO {
  id: string
  name: string
  type: 'monthly' | 'tax' | 'expense' | 'custom'
  format: 'pdf' | 'csv' | 'excel'
  status: 'generating' | 'completed' | 'failed'
  downloadUrl: string
  fileSize: number
  createdAt: string
  expiresAt: string
}

export interface GenerateReportResponseDTO {
  reportId: string
  downloadUrl: string
  expiresAt: string
  format: string
  fileSize: number
}

// ============================================================================
// Notification DTOs
// ============================================================================

export interface NotificationMetadata {
  transactionId?: string
  budgetId?: string
  billId?: string
  goalId?: string
  accountId?: string
  categoryId?: string
  amount?: number
  percentage?: number
  dueDate?: string
  [key: string]: string | number | undefined
}

export interface NotificationDTO {
  id: string
  type: 'bill' | 'budget' | 'goal' | 'transaction' | 'system'
  title: string
  message: string
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  metadata?: NotificationMetadata
  createdAt: string
}

export interface NotificationFilters {
  unreadOnly?: boolean
  type?: 'bill' | 'budget' | 'goal' | 'transaction' | 'system'
  page?: number
  limit?: number
}

export interface NotificationPaginatedResponse extends PaginatedResponse<NotificationDTO> {
  pagination: PaginatedResponse<NotificationDTO>['pagination'] & {
    unreadCount: number
  }
}

// ============================================================================
// User Preferences DTOs
// ============================================================================

export interface UserPreferencesDTO {
  currency: string
  language: string
  theme: 'dark' | 'light' | 'system'
  dateFormat: string
  timeFormat: '12h' | '24h'
  notifications: {
    email: {
      enabled: boolean
      billReminders: boolean
      budgetAlerts: boolean
      goalMilestones: boolean
      weeklyReport?: boolean
      weeklyReports: boolean
      monthlyReports: boolean
      securityAlerts: boolean
    }
    push: {
      enabled: boolean
      billReminders: boolean
      budgetAlerts: boolean
      largeTransactions: boolean
    }
    reminderTime: string
  }
  privacy: {
    showBalance: boolean
    analyticsConsent: boolean
  }
  integrations: {
    bankSync: {
      enabled: boolean
      lastSync: string | null
    }
  }
}

export interface UpdatePreferencesDTO {
  currency?: string
  language?: string
  theme?: 'dark' | 'light' | 'system'
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  notifications?: Partial<UserPreferencesDTO['notifications']>
  privacy?: Partial<UserPreferencesDTO['privacy']>
  integrations?: Partial<UserPreferencesDTO['integrations']>
}

export interface UpdateProfileDTO {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordDTO {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ============================================================================
// Dashboard DTOs
// ============================================================================

export interface DashboardWidgetsDTO {
  summary: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
    savingsRate: number
    trends: {
      balance: TrendDTO
      income: TrendDTO
      expenses: TrendDTO
    }
  }
  recentTransactions: TransactionDTO[]
  upcomingBills: BillDTO[]
  budgetAlerts: {
    category: string
    percentage: number
    severity: 'critical' | 'warning' | 'info'
  }[]
  goalProgress: GoalDTO[]
}

// ============================================================================
// Utility DTOs
// ============================================================================

export interface LocationDTO {
  address?: string
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface AttachmentDTO {
  id: string
  filename: string
  url: string
  type: string
  size: number
}

export interface WebhookSubscribeDTO {
  url: string
  events: string[]
  secret: string
}

export interface WebhookPayloadDTO {
  event: string
  timestamp: string
  data: Record<string, unknown>
  signature: string
}

// ============================================================================
// Merchant Types
// ============================================================================

export interface LocationDTO {
  address?: string
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface MerchantDTO {
  id: string
  userId: string
  name: string
  phone?: string
  location?: LocationDTO
  color: string
  icon?: string
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
    icon?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateMerchantDTO {
  name: string
  phone?: string
  location?: LocationDTO
  color?: string
  icon?: string
  categoryId?: string
}

export interface UpdateMerchantDTO {
  name?: string
  phone?: string
  location?: LocationDTO
  color?: string
  icon?: string
  categoryId?: string
}

export interface MerchantStatsDTO {
  totalMerchants: number
  merchantsByCategory: Array<{
    category: string
    count: number
  }>
  topMerchants: Array<{
    id: string
    name: string
    transactionCount: number
  }>
}

// Stats for a specific merchant
export interface MerchantDetailStatsDTO {
  merchantId: string
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  firstTransaction: string
  lastTransaction: string
  topCategory: {
    id: string
    name: string
    count: number
  }
  monthlyAverage: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely'
}
