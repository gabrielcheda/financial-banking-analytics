import BudgetsClient from './BudgetsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Budgets | BankDash',
  description: 'Manage your budgets and spending limits',
}

export default function BudgetsPage() {
  return <BudgetsClient />
}
