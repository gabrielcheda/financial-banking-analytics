import { NextRequest } from 'next/server'
import { proxyRequest } from '@/app/api/internal/_utils/proxy'

interface RouteParams {
  params: {
    path?: string[]
  }
}

const createHandler =
  (method: string) =>
  (request: NextRequest, { params }: RouteParams) => {
    const pathSegments = params.path ?? []
    const backendPath = `/${pathSegments.join('/')}`

    return proxyRequest(request, {
      backendPath,
      method,
    })
  }

export const GET = createHandler('GET')
export const POST = createHandler('POST')
export const PUT = createHandler('PUT')
export const PATCH = createHandler('PATCH')
export const DELETE = createHandler('DELETE')
