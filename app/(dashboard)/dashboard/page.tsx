/**
 * Dashboard Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  return <DashboardClient />
}
