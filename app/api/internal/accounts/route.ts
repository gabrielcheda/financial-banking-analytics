import { NextRequest } from 'next/server'
import { proxyRequest } from '@/app/api/internal/_utils/proxy'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_PATH = '/accounts'

export async function GET(request: NextRequest) {
  return proxyRequest(request, { backendPath: BASE_PATH })
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, { backendPath: BASE_PATH })
}
