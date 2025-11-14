import { AuthResponseDTO } from '@/types/dto'
import { ApiError } from 'next/dist/server/api-utils'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    try {

        console.log("this is request", `${process.env.API_URL}/auth/login`)
        console.log("this is request", body)

        const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        console.log("[route.ts] response", response);
        const result = await response.json()


        if (!response.ok) {
            return NextResponse.json({
                message: result.message || 'Login failed',
                statusCode: response.status,
                name: result.error ?? "ERROR"
            } as ApiError, {
                status: response.status
            })
        }

        const authResponse: AuthResponseDTO = result.data


        console.log("[route.ts] authResponse", authResponse);

        const cookieStore = await cookies()

        if (body.rememberMe) {
            cookieStore.set('rememberMe', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            })
        }

        // Salva tokens em cookies httpOnly (seguros!)
        cookieStore.set('accessToken', authResponse.tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
        })

        cookieStore.set('refreshToken', authResponse.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
        })

        return NextResponse.json({
            user: authResponse.user,
            tokens: authResponse.tokens
        }, {
            status: response.status
        })
    } catch (error) {

        console.log("[route.ts] error", error);

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