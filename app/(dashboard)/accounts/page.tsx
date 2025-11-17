import AccountsClient from './AccountsClient'

export const metadata = {
  title: 'Accounts | BankDash',
  description: 'Manage your financial accounts',
}

export default async function AccountsPage() {
  return <AccountsClient />
}
