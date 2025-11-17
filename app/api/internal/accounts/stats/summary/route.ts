import { NextRequest } from 'next/server'
import { proxyRequest } from '@/app/api/internal/_utils/proxy'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  return proxyRequest(request, { backendPath: '/accounts/stats/summary' })
}
