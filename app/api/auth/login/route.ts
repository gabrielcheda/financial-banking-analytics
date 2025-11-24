import { AuthResponseDTO } from '@/types/dto'
import { ApiError } from 'next/dist/server/api-utils'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    try {
        const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        const result = await response.json()

        if (!response.ok) {
            return NextResponse.json({
                message: result.data.error.message || 'Login failed',
                statusCode: response.status,
                name: result.data.error.code
            } as ApiError, {
                status: response.status
            })
        }

        const authResponse: AuthResponseDTO = result.data
        const rememberMe = Boolean(body.rememberMe)
        const accessTokenMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60
        const refreshTokenMaxAge = rememberMe ? 60 * 60 * 24 * 60 : 60 * 60 * 24 * 7

        const cookieStore = await cookies()

        if (rememberMe) {
            cookieStore.set('rememberMe', 'true', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            })
        } else {
            cookieStore.delete('rememberMe')
        }

        // Salva tokens em cookies httpOnly (seguros!)
        const accessTokenCookiesOptions = {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: accessTokenMaxAge,
            path: '/',
        }

        cookieStore.set('accessToken', authResponse.tokens.accessToken, {
            ...accessTokenCookiesOptions,
            httpOnly: true,
        })

        cookieStore.set('accessTokenPublic', authResponse.tokens.accessToken, {
            ...accessTokenCookiesOptions,
            httpOnly: false,
        })

        cookieStore.set('refreshToken', authResponse.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshTokenMaxAge,
            path: '/',
        })

        return NextResponse.json({
            user: authResponse.user,
            tokens: authResponse.tokens
        }, {
            status: response.status
        })
    } catch (error) {
        return NextResponse.json(
            {
                message: 'Internal Server Error',
                statusCode: '500',
                name: 'InternalServerError'
            }, {
            status: 500
        }
        )
    }
}
