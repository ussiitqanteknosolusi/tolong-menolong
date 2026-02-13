/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ✅ Image Optimization — Enable Next.js built-in optimizer
  images: {
    // Remove 'unoptimized: true' to let Next.js compress and resize images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache optimized images for 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: '**.hostingersite.com' },
      { protocol: 'https', hostname: 'steelblue-tiger-791529.hostingersite.com' },
    ],
  },

  // ✅ Compression — gzip/brotli on responses
  compress: true,

  // ✅ Powered by header removal (security + minor perf)
  poweredByHeader: false,

  // ✅ Strict mode for catching issues early
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },

  // Dev-only: reduce watcher CPU
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },

  // ✅ Cache static assets aggressively + security headers
  async headers() {
    return [
      // Static assets — cache for 1 year (immutable hash filenames)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API routes — short cache with stale-while-revalidate
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=30, stale-while-revalidate=60' },
          { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGINS || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
      // Global security headers
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
