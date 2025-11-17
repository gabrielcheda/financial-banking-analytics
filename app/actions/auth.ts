// app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { LoginDTO, RegisterDTO } from '@/types/dto'

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

        const result = await response.json();

        if (!response.ok) {
            return { error: result.error?.message || 'Invalid credentials' }
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
        return { error: 'Failed to connect to server' }
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

export async function registerAction(prevState: any, formData: FormData) {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    const registerDto: RegisterDTO = {
        email: formData.get('email') as string,
        password,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phone: formData.get('phone') as string || '',
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerDto),
        })

        const result = await response.json()

        if (!response.ok) {
            return {
                error: result.message,
                details: result.error || 'Registration failed'
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
        console.log(`error`, error);
        return { error: 'Failed to connect to server' }
    }
}
