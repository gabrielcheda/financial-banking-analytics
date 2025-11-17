/**
 * Analytics Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  return <AnalyticsClient />
}
