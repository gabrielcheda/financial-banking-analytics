const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.API_URL || 'http://localhost:3001/api/v1'
const additionalConnectSrc = []

try {
  additionalConnectSrc.push(new URL(backendApiUrl).origin)
} catch {
  additionalConnectSrc.push('http://localhost:3001')
}

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    additionalConnectSrc.push(new URL(process.env.NEXT_PUBLIC_API_URL).origin)
  } catch {
    // noop
  }
}

if (process.env.NEXT_PUBLIC_WS_URL) {
  additionalConnectSrc.push(process.env.NEXT_PUBLIC_WS_URL)
}

const connectSrcValues = [
  "'self'",
  ...additionalConnectSrc,
  'https://vitals.vercel-insights.com',
  'ws://localhost:3000',
  'ws://localhost:3001',
]
  .filter(Boolean)
  .filter((value, index, array) => array.indexOf(value) === index)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en',
    localeDetection: true,
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Code splitting for heavy dependencies
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Recharts bundle
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              name: 'recharts',
              priority: 20,
            },
            // React Query bundle
            reactQuery: {
              test: /[\\/]node_modules[\\/](@tanstack[\\/]react-query)[\\/]/,
              name: 'react-query',
              priority: 15,
            },
            // Framer Motion bundle
            framerMotion: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: 'framer-motion',
              priority: 15,
            },
            // Vendor bundle for other dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
            },
          },
        },
      }
    }

    return config
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Production source maps (smaller)
  productionBrowserSourceMaps: false,

  // Experimental features for better performance
  experimental: {
    // Optimize CSS imports - disabled due to missing critters dependency
    // optimizeCss: true,
    // Enable module concatenation
    webpackBuildWorker: true,
  },

  // Redirect DevTools requests to avoid 404
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/:path*',
        destination: '/api/not-found',
      },
    ]
  },

  // ✅ Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src ${connectSrcValues.join(' ')}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
