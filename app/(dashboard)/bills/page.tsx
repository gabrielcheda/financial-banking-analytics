import BillsClient from './BillsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bills | BankDash',
  description: 'Track and manage your bills and payments',
}

export default function BillsPage() {
  return <BillsClient />
}
