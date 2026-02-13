import { NextResponse } from 'next/server';

// ============================================================
// ✅ Production-Ready Rate Limiter (In-Memory Sliding Window)
// ============================================================
// Uses a compact Map<string, {count, resetTime}> instead of
// storing every timestamp. This is O(1) per request.
// ============================================================

const WINDOW_MS = 60_000;     // 1 minute window
const MAX_REQUESTS = 60;      // 60 requests per minute per IP
const CLEANUP_INTERVAL = 120_000; // Cleanup every 2 minutes

const clients = new Map(); // IP -> { count: number, resetTime: number }
let lastCleanup = Date.now();

export function middleware(request) {
  // Skip rate limiting for webhook endpoints (DOKU/Xendit notifications)
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  const now = Date.now();

  // Get client IP
  let ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();

  // Get or create entry
  let entry = clients.get(ip);

  if (!entry || now > entry.resetTime) {
    // New window
    entry = { count: 1, resetTime: now + WINDOW_MS };
    clients.set(ip, entry);
  } else {
    entry.count++;
  }

  // Check limit
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Terlalu banyak request. Coba lagi nanti.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetTime),
        },
      }
    );
  }

  // Periodic cleanup of expired entries (avoid memory leak)
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const [key, val] of clients) {
      if (now > val.resetTime) clients.delete(key);
    }
  }

  // Add rate limit info headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - entry.count)));
  return response;
}

// ✅ Only run middleware on API routes — NOT on static assets, images, or pages!
// This is critical: without this, middleware runs on every /_next/static request too.
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
