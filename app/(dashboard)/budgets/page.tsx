import { Metadata } from 'next'
import BudgetsClient from './BudgetsClient'

export const metadata: Metadata = {
  title: 'Budgets | BankDash',
  description: 'Manage your budgets and spending limits',
}

export default async function BudgetsPage() {
  return <BudgetsClient />
}
