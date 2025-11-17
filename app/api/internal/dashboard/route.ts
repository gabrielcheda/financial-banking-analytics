import { NextRequest } from 'next/server'
import { proxyRequest } from '@/app/api/internal/_utils/proxy'

export async function GET(request: NextRequest) {
  return proxyRequest(request, { backendPath: '/dashboard' })
}
