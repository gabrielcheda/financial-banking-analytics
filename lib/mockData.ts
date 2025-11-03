import { Account, Transaction, FinancialGoal, Bill, Budget } from '@/types'

// Accounts data
export const accounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Primary Checking',
    type: 'checking',
    balance: 15420.50,
    currency: 'USD',
    lastUpdated: new Date('2024-01-15'),
  },
  {
    id: 'acc-2',
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 45000.00,
    currency: 'USD',
    lastUpdated: new Date('2024-01-15'),
  },
  {
    id: 'acc-3',
    name: 'Emergency Fund',
    type: 'savings',
    balance: 28500.75,
    currency: 'USD',
    lastUpdated: new Date('2024-01-15'),
  },
  {
    id: 'acc-4',
    name: 'Rewards Credit Card',
    type: 'credit',
    balance: -2340.25,
    currency: 'USD',
    lastUpdated: new Date('2024-01-15'),
  },
]

// Categories with colors
export const categories = [
  { name: 'Food & Dining', color: '#3b82f6' },
  { name: 'Transportation', color: '#8b5cf6' },
  { name: 'Shopping', color: '#ec4899' },
  { name: 'Entertainment', color: '#f59e0b' },
  { name: 'Bills & Utilities', color: '#10b981' },
  { name: 'Healthcare', color: '#ef4444' },
  { name: 'Education', color: '#06b6d4' },
  { name: 'Travel', color: '#f97316' },
  { name: 'Income', color: '#22c55e' },
  { name: 'Groceries', color: '#84cc16' },
  { name: 'Insurance', color: '#6366f1' },
  { name: 'Fitness', color: '#14b8a6' },
]

// Merchants by category
const merchants = {
  'Food & Dining': ['Starbucks', 'McDonald\'s', 'Chipotle', 'Olive Garden', 'Subway', 'Pizza Hut', 'Domino\'s', 'Panera Bread'],
  'Transportation': ['Shell Gas', 'Uber', 'Lyft', 'Metro Transit', 'Chevron', 'BP Gas Station'],
  'Shopping': ['Amazon', 'Target', 'Walmart', 'Best Buy', 'Home Depot', 'IKEA', 'Costco', 'Apple Store'],
  'Entertainment': ['Netflix', 'Spotify', 'AMC Theaters', 'Steam', 'PlayStation Store', 'Disney+'],
  'Bills & Utilities': ['Electric Company', 'Water Utility', 'Internet Provider', 'Phone Bill', 'Gas Company'],
  'Healthcare': ['CVS Pharmacy', 'Walgreens', 'Medical Clinic', 'Dental Care', 'Vision Center'],
  'Education': ['Amazon Books', 'Coursera', 'Udemy', 'University Bookstore'],
  'Travel': ['Delta Airlines', 'Airbnb', 'Marriott Hotels', 'Expedia', 'Hertz Rental'],
  'Income': ['Payroll Direct Deposit', 'Freelance Payment', 'Investment Dividend', 'Tax Refund'],
  'Groceries': ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Kroger', 'Aldi'],
  'Insurance': ['State Farm', 'Geico', 'Health Insurance Co'],
  'Fitness': ['Planet Fitness', 'LA Fitness', 'Yoga Studio', 'Peloton'],
}

// Generate transactions for the last 12 months
function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  const now = new Date()
  const accountIds = accounts.map(a => a.id)

  // Generate 500+ transactions
  for (let i = 0; i < 550; i++) {
    // Random date within last 12 months
    const daysAgo = Math.floor(Math.random() * 365)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    // Weighted random category (more common categories appear more often)
    const categoryWeights = {
      'Food & Dining': 0.20,
      'Groceries': 0.15,
      'Transportation': 0.12,
      'Shopping': 0.15,
      'Bills & Utilities': 0.10,
      'Entertainment': 0.08,
      'Healthcare': 0.05,
      'Education': 0.03,
      'Travel': 0.04,
      'Income': 0.05,
      'Insurance': 0.02,
      'Fitness': 0.01,
    }

    const rand = Math.random()
    let cumulative = 0
    let selectedCategory = 'Shopping'

    for (const [cat, weight] of Object.entries(categoryWeights)) {
      cumulative += weight
      if (rand <= cumulative) {
        selectedCategory = cat
        break
      }
    }

    const isIncome = selectedCategory === 'Income'
    const merchantList = merchants[selectedCategory as keyof typeof merchants]
    const merchant = merchantList[Math.floor(Math.random() * merchantList.length)]

    // Amount ranges by category
    let amount = 0
    if (isIncome) {
      amount = Math.random() * 2000 + 3000 // $3000-$5000
    } else if (selectedCategory === 'Bills & Utilities' || selectedCategory === 'Insurance') {
      amount = Math.random() * 100 + 50 // $50-$150
    } else if (selectedCategory === 'Groceries') {
      amount = Math.random() * 100 + 30 // $30-$130
    } else if (selectedCategory === 'Food & Dining') {
      amount = Math.random() * 50 + 10 // $10-$60
    } else if (selectedCategory === 'Travel') {
      amount = Math.random() * 800 + 200 // $200-$1000
    } else if (selectedCategory === 'Shopping') {
      amount = Math.random() * 300 + 20 // $20-$320
    } else {
      amount = Math.random() * 150 + 20 // $20-$170
    }

    amount = Math.round(amount * 100) / 100

    // Recurring transactions (bills)
    const isRecurring = ['Bills & Utilities', 'Insurance', 'Fitness'].includes(selectedCategory)

    transactions.push({
      id: `txn-${i + 1}`,
      date,
      description: merchant,
      amount: isIncome ? amount : -amount,
      type: isIncome ? 'income' : 'expense',
      category: selectedCategory,
      merchant,
      accountId: accountIds[Math.floor(Math.random() * accountIds.length)],
      status: Math.random() > 0.05 ? 'completed' : 'pending',
      notes: isRecurring ? 'Recurring monthly charge' : undefined,
    })
  }

  // Sort by date (newest first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const transactions = generateTransactions()

// Financial Goals
export const financialGoals: FinancialGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 30000,
    currentAmount: 28500.75,
    deadline: new Date('2024-06-30'),
    category: 'Savings',
    priority: 'high',
  },
  {
    id: 'goal-2',
    name: 'Summer Vacation',
    targetAmount: 5000,
    currentAmount: 2800,
    deadline: new Date('2024-07-01'),
    category: 'Travel',
    priority: 'medium',
  },
  {
    id: 'goal-3',
    name: 'New Car Down Payment',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: new Date('2024-12-31'),
    category: 'Transportation',
    priority: 'high',
  },
  {
    id: 'goal-4',
    name: 'Home Renovation',
    targetAmount: 25000,
    currentAmount: 5000,
    deadline: new Date('2025-06-01'),
    category: 'Home',
    priority: 'medium',
  },
  {
    id: 'goal-5',
    name: 'Retirement Fund',
    targetAmount: 100000,
    currentAmount: 45000,
    deadline: new Date('2030-12-31'),
    category: 'Investment',
    priority: 'high',
  },
]

// Bills
export const bills: Bill[] = [
  {
    id: 'bill-1',
    name: 'Rent/Mortgage',
    amount: 1850,
    dueDate: new Date('2024-02-01'),
    category: 'Bills & Utilities',
    isPaid: false,
    isRecurring: true,
  },
  {
    id: 'bill-2',
    name: 'Electric Bill',
    amount: 120,
    dueDate: new Date('2024-01-20'),
    category: 'Bills & Utilities',
    isPaid: true,
    isRecurring: true,
  },
  {
    id: 'bill-3',
    name: 'Internet',
    amount: 79.99,
    dueDate: new Date('2024-01-25'),
    category: 'Bills & Utilities',
    isPaid: false,
    isRecurring: true,
  },
  {
    id: 'bill-4',
    name: 'Car Insurance',
    amount: 145,
    dueDate: new Date('2024-01-28'),
    category: 'Insurance',
    isPaid: false,
    isRecurring: true,
  },
  {
    id: 'bill-5',
    name: 'Phone Bill',
    amount: 65,
    dueDate: new Date('2024-01-22'),
    category: 'Bills & Utilities',
    isPaid: true,
    isRecurring: true,
  },
]

// Budget data
export const budgets: Budget[] = [
  { category: 'Food & Dining', limit: 600, spent: 485.50, percentage: 80.92 },
  { category: 'Groceries', limit: 500, spent: 420.75, percentage: 84.15 },
  { category: 'Transportation', limit: 300, spent: 245.00, percentage: 81.67 },
  { category: 'Shopping', limit: 400, spent: 520.25, percentage: 130.06 },
  { category: 'Entertainment', limit: 200, spent: 145.99, percentage: 73.00 },
  { category: 'Bills & Utilities', limit: 500, spent: 485.00, percentage: 97.00 },
  { category: 'Healthcare', limit: 200, spent: 85.50, percentage: 42.75 },
  { category: 'Fitness', limit: 100, spent: 65.00, percentage: 65.00 },
]

// Helper functions
export function getCategoryColor(category: string): string {
  const cat = categories.find(c => c.name === category)
  return cat?.color || '#6b7280'
}

export function getRecentTransactions(count: number = 10): Transaction[] {
  return transactions.slice(0, count)
}

export function getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
  return transactions.filter(t => t.date >= startDate && t.date <= endDate)
}

export function getTotalBalance(): number {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0)
}

export function getMonthlyIncome(): number {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return transactions
    .filter(t => t.type === 'income' && t.date >= firstDay && t.date <= lastDay)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getMonthlyExpenses(): number {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return Math.abs(
    transactions
      .filter(t => t.type === 'expense' && t.date >= firstDay && t.date <= lastDay)
      .reduce((sum, t) => sum + t.amount, 0)
  )
}
