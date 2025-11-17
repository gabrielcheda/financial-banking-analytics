/**
 * Planning Page (Server Component with SSR Hydration)
 *
 * Este é um Server Component que pode fazer prefetch de dados no servidor
 * e hidratar o React Query cache no cliente
 */

import PlanningClient from './PlanningClient'

export default async function PlanningPage() {
  return <PlanningClient />
}
