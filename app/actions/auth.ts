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

        // ✅ Salva cookies com httpOnly para segurança contra XSS
        cookies().set('accessToken', result.tokens.accessToken, {
            httpOnly: true,      // ← JavaScript não pode acessar
            secure: process.env.NODE_ENV === 'production',  // ← HTTPS apenas em produção
            sameSite: 'strict',  // ← Anti-CSRF
            path: '/',
            maxAge: 3600, // 1 hora
        })

        cookies().set('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // ← HTTPS apenas em produção
            sameSite: 'strict',
            path: '/api/auth/refresh',  // ← Apenas endpoint de refresh
            maxAge: 604800, // 7 dias
        })

        // ✅ Retorna sucesso com URL de redirecionamento
        return {
            success: true,
            redirectTo: redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'
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
    cookies().delete('refreshToken')

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
        cookies().set('accessToken', result.tokens.accessToken, {
            httpOnly: true,      // ← JavaScript não pode acessar
            secure: process.env.NODE_ENV === 'production',  // ← HTTPS apenas em produção
            sameSite: 'strict',  // ← Anti-CSRF
            path: '/',
            maxAge: 3600, // 1 hora
        })

        cookies().set('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // ← HTTPS apenas em produção
            sameSite: 'strict',
            path: '/api/auth/refresh',
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