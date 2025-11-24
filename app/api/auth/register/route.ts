// app/api/auth/register/route.ts
import { AuthResponseDTO, RegisterDTO } from '@/types/dto'
import { ApiError } from 'next/dist/server/api-utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body: RegisterDTO = await request.json()

    try {
        // Validação básica antes de enviar para API
        const { email, password, firstName, lastName } = body

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                {
                    name: 'BadRequest',
                    message: 'Missing required fields',
                    statusCode: 400
                } as ApiError, {
                status: 400
            }
            )
        }

        // Chama API externa de registro
        const response = await fetch(`${process.env.API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
       
        const responseJson = await response.json();

        if(responseJson.success === false) { 
            return NextResponse.json({ 
                name: responseJson.data.error.code ?? "ERROR",
                message: responseJson.data.error.message
            }, {
                status: response.status
            })
        }
        
        const authResponse: AuthResponseDTO = responseJson.data;

        if (!response.ok) {
            return NextResponse.json({
                message: (authResponse as any)?.message || 'Registration failed',
                statusCode: response.status,
                name: (authResponse as any).error ?? "ERROR"
            } as ApiError, {
                status: response.status
            })
        }

        return NextResponse.json({
            user: authResponse.user,
            tokens: authResponse.tokens
        }, {
            status: response.status
        })

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json({
            message: 'Internal Server Error',
            statusCode: '500',
            name: 'InternalServerError'
        },
            {
                status: 500
            }
        )
    }
}