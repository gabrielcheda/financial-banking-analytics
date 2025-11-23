import type { Metadata } from 'next'
import CategoriesClient from './CategoriesClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export const metadata: Metadata = {
  title: 'Categories | BankDash',
  description: 'Organize your transactions with custom categories and subcategories',
  alternates: {
    canonical: `${baseUrl}/categories`,
  },
  openGraph: {
    title: 'Categories | BankDash',
    description: 'Organize your transactions with custom categories and subcategories',
    url: `${baseUrl}/categories`,
    siteName: 'BankDash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories | BankDash',
    description: 'Organize your transactions with custom categories and subcategories',
  },
}

export default function CategoriesPage() {
  return <CategoriesClient />
}
