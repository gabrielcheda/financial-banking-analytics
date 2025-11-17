import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { QueryProvider } from '@/components/QueryProvider'
import { Toaster } from '@/components/Toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { locales, type Locale } from '@/i18n'

const inter = Inter({ subsets: ['latin'] })

type LocaleLayoutProps = {
  children: ReactNode
  params: {
    locale: Locale
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  if (!locales.includes(locale)) {
    notFound()
  }

  unstable_setRequestLocale(locale)

  let messages: Record<string, any>
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  const externalOrigins = [
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_URL,
  ]
    .filter(Boolean)
    .map((url) => {
      try {
        return new URL(url as string).origin
      } catch {
        return null
      }
    })
    .filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {externalOrigins.map((origin) => (
          <link key={origin} rel="preconnect" href={origin} crossOrigin="anonymous" />
        ))}
        <link rel="preload" as="style" href="/globals.css" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <QueryProvider>
                {children}
                <Toaster />
              </QueryProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
