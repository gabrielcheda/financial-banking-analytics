import { NextRequest } from 'next/server'
import { proxyRequest } from '@/app/api/internal/_utils/proxy'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxyRequest(request, { backendPath: `/accounts/${params.id}` })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return proxyRequest(request, { backendPath: `/accounts/${params.id}` })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxyRequest(request, { backendPath: `/accounts/${params.id}` })
}
