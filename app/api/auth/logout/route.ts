import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Logout route - clear httpOnly cookies and notify backend
 */
export async function POST() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
  const cookieStore = cookies()

  if (apiUrl) {
    try {
      const cookieHeader = cookieStore
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join('; ')

      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
      })
    } catch (error) {
      console.warn('[logout route] Failed to notify backend logout:', error)
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('accessToken')
  response.cookies.delete('accessTokenPublic')
  response.cookies.delete('refreshToken')

  return response
}
