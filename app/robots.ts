import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bankdash.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes should not be indexed
          '/_next/',         // Next.js internal routes
          '/static/',        // Static assets
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
