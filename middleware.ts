import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

/**
 * ✅ Gera token CSRF usando Web Crypto API (compatível com Edge Runtime)
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // ✅ CSRF Protection: Gerar token CSRF se não existir
  if (!request.cookies.has('csrf-token')) {
    const csrfToken = generateCsrfToken()

    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false,  // Cliente precisa ler para enviar no header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    response.cookies.set('csrf-token-secure', csrfToken, {
      httpOnly: true,  // Servidor valida
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
  }

  // ✅ CSRF Protection: Validar apenas em requisições de API (fetch/axios)
  // Não validar em navegação normal do browser ou Server Actions
  const isApiRequest = request.headers.get('content-type')?.includes('application/json') ||
                       request.headers.get('x-requested-with') === 'XMLHttpRequest'

  if (isApiRequest && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const clientToken = request.headers.get('x-csrf-token')
    const serverToken = request.cookies.get('csrf-token-secure')?.value

    // Apenas validar se ambos existem
    if (serverToken && clientToken !== serverToken) {
      return new NextResponse('Invalid CSRF token', { status: 403 })
    }
  }

  // Get token from cookie
  const token = request.cookies.get('accessToken')?.value

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  // If trying to access public route while authenticated, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If trying to access protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
}
