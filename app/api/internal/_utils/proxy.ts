import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api/v1'
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

interface ProxyOptions {
  backendPath: string
  method?: string
}

export async function proxyRequest(request: NextRequest, options: ProxyOptions) {
  const { backendPath, method = request.method } = options

  try {
    const incomingUrl = new URL(request.url)
    const targetUrl = new URL(`${BACKEND_API_URL}${backendPath}`)
    targetUrl.search = incomingUrl.search

    const headers = new Headers()
    const acceptHeader = request.headers.get('accept')
    if (acceptHeader) {
      headers.set('accept', acceptHeader)
    }

    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers.set('content-type', contentType)
    }

    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers.set('cookie', cookieHeader)
    }

    const hasBody = METHODS_WITH_BODY.has(method.toUpperCase())
    const body = hasBody ? await request.arrayBuffer() : undefined

    const backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    })

    const responseHeaders = new Headers(backendResponse.headers)
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[proxyRequest] Failed to proxy request', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Proxy request failed',
          code: 'PROXY_ERROR',
        },
        data: null,
      },
      { status: 502 }
    )
  }
}
