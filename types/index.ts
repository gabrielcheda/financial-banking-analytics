export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'pending' | 'completed'
export type AccountType = 'checking' | 'savings' | 'credit'
export type GoalPriority = 'low' | 'medium' | 'high'

export interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  type: TransactionType
  category: string
  merchant: string
  accountId: string
  status: TransactionStatus
  notes?: string
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  lastUpdated: Date
}

export interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  category: string
  priority: GoalPriority
}

export interface MonthlySpending {
  month: string
  amount: number
}

export interface CategorySpending {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: Date
  category: string
  isPaid: boolean
  isRecurring: boolean
}

export interface Budget {
  category: string
  limit: number
  spent: number
  percentage: number
}
