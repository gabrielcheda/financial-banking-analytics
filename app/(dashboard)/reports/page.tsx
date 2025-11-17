/**
 * Reports Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  return <ReportsClient />
}
