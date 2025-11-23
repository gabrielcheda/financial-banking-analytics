import { redirect } from 'next/navigation'

/**
 * Home Page - Redirect to Dashboard
 *
 * Server-side redirect for optimal performance and SEO
 */
export default function HomePage() {
  redirect('/dashboard')
}
