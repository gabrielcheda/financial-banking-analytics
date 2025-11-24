// app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { LoginDTO, RegisterDTO } from '@/types/dto'
import { translateError } from '@/lib/error-translator'

export type RegisterActionState = {
    error?: string | null
    details?: Record<string, string> | string | null
    success?: boolean
    redirectTo?: string
}

type ApiErrorPayload = {
    message?: unknown
    [key: string]: any
}

interface ApiResult {
    success?: boolean
    message?: string | string[]
    error?: ApiErrorPayload
    data?: {
        error?: ApiErrorPayload
        [key: string]: any
    } & Record<string, any>
    [key: string]: any
}

function normalizeMessage(message?: unknown): string | undefined {
    if (message == null) return undefined

    if (typeof message === 'string') {
        return message
    }

    if (Array.isArray(message)) {
        const parts = message
            .map((item) => normalizeMessage(item))
            .filter((part): part is string => Boolean(part))

        return parts.length ? parts.join(', ') : undefined
    }

    if (typeof message === 'object') {
        const value = message as Record<string, unknown>

        if (value.constraints && typeof value.constraints === 'object') {
            const constraintMessages = Object.values(value.constraints as Record<string, unknown>)
                .map((constraint) => normalizeMessage(constraint))
                .filter((part): part is string => Boolean(part))

            if (constraintMessages.length) {
                return constraintMessages.join(', ')
            }
        }

        if ('message' in value) {
            const nestedMessage = normalizeMessage(value.message)
            if (nestedMessage) return nestedMessage
        }

        if ('messages' in value) {
            const nestedMessages = normalizeMessage(value.messages)
            if (nestedMessages) return nestedMessages
        }

        if ('error' in value) {
            const nestedError = normalizeMessage(value.error)
            if (nestedError) return nestedError
        }

        return undefined
    }

    return String(message)
}

function extractApiError(result: ApiResult | null, fallback: string) {
    const details = result?.error ?? result?.data?.error
    const message =
        normalizeMessage(details?.message) ??
        normalizeMessage(result?.message) ??
        fallback

    return {
        message,
        details,
    }
}

async function parseResponseJson(response: Response): Promise<ApiResult | null> {
    try {
        return (await response.json()) as ApiResult
    } catch {
        return null
    }
}

export async function loginAction(prevState: any, formData: FormData) {
    const loginDto: LoginDTO = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        rememberMe: formData.get('rememberMe') === 'on',
    }

    const redirectTo = formData.get('redirect') as string | null
    const rememberMe = loginDto.rememberMe
    const accessTokenMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60
    const refreshTokenMaxAge = rememberMe ? 60 * 60 * 24 * 60 : 60 * 60 * 24 * 7

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginDto),
        })

        const result = await parseResponseJson(response)

        if (!response.ok || result?.success === false) {
            const { message } = extractApiError(result, 'Invalid credentials')
            // Traduz a mensagem de erro do backend para chave i18n
            const translatedKey = translateError(message) || message
            return { error: translatedKey }
        }

        if (!result || !result.tokens) {
            return { error: translateError('Invalid server response') || 'errors.network.invalidResponse' }
        }

        cookies().set('rememberMe', rememberMe ? 'true' : 'false', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        })

        // ✅ Salva cookies com httpOnly para segurança contra XSS
        const accessTokenCookiesOptions = {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            maxAge: accessTokenMaxAge,
        }

        cookies().set('accessToken', result.tokens.accessToken, {
            ...accessTokenCookiesOptions,
            httpOnly: true,
        })

        // Token legível pelo cliente apenas para Authorization header
        cookies().set('accessTokenPublic', result.tokens.accessToken, {
            ...accessTokenCookiesOptions,
            httpOnly: false,
        })

        cookies().set('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // ← HTTPS apenas em produção
            sameSite: 'lax',
            path: '/',
            maxAge: refreshTokenMaxAge,
        })
        
        // ✅ Retorna sucesso com URL de redirecionamento
        const safeRedirect = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'

        return {
            success: true,
            redirectTo: safeRedirect,
            tokens: result.tokens
        }

    } catch (error) {
        return { error: translateError('Failed to connect to server') || 'errors.network.noResponse' }
    }
}

/**
 * Logout action - Clear all cookies and redirect to login
 */
export async function logoutAction() {
    // Clear auth cookies
    cookies().delete('accessToken')
    cookies().delete('accessTokenPublic')
    cookies().delete('refreshToken')
    cookies().delete('rememberMe')

    // Redirect to login
    redirect('/login')
}

export async function registerAction(
    prevState: RegisterActionState,
    formData: FormData
): Promise<RegisterActionState> {
    const phoneInput = (formData.get('phone') as string | null) ?? ''
    const phone = phoneInput.trim()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: 'errors.validation.passwordsDoNotMatch' }
    }

    if (phone) {
        const phoneRegex = /^[+]?[\d()\s-]{6,20}$/
        if (!phoneRegex.test(phone)) {
            return {
                error: 'errors.validation.invalidPhoneNumber',
                details: {
                    phone: 'errors.validation.phoneNumberFormat',
                },
            }
        }
    }

    const registerDto: RegisterDTO = {
        email: formData.get('email') as string,
        password,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phone,
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerDto),
        })

        const result = await parseResponseJson(response)

        if (!response.ok || result?.success === false) {
            const { message, details } = extractApiError(result, 'Registration failed')
            const translatedKey = translateError(message) || message
            return {
                error: translatedKey,
                details: details || 'errors.validation.registrationFailed',
            }
        }

        if (!result || !result.tokens) {
            return { 
                error: translateError('Invalid server response') || 'errors.network.invalidResponse', 
                details: 'Missing tokens in response' 
            }
        }

        // ✅ Salva cookies com httpOnly (auto-login após registro)
        const accessTokenCookiesOptions = {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        }

        cookies().set('accessToken', result.tokens.accessToken, {
            ...accessTokenCookiesOptions,
            httpOnly: true,
            maxAge: 3600, // 1 hora
        })

        cookies().set('accessTokenPublic', result.tokens.accessToken, {
            ...accessTokenCookiesOptions,
            httpOnly: false,
            maxAge: 3600,
        })

        cookies().set('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // ← HTTPS apenas em produção
            sameSite: 'lax',
            path: '/',
            maxAge: 604800, // 7 dias
        })

        // ✅ Retorna sucesso com URL de redirecionamento
        return {
            success: true,
            redirectTo: '/dashboard'
        }
    } catch (error) {
        return { error: translateError('Failed to connect to server') || 'errors.network.noResponse' }
    }
}
