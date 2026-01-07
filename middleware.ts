import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for API routes
// In production with multiple instances, use Redis/KV for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute per IP

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://warpcast.com',
  'https://www.warpcast.com',
  /^https:\/\/.*\.farcaster\.xyz$/,
  /^https:\/\/.*\.warpcast\.com$/,
]

function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  // Fallback
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetIn: record.resetTime - now }
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true // Same-origin requests don't have Origin header

  return ALLOWED_ORIGINS.some((allowed) => {
    if (typeof allowed === 'string') {
      return allowed === origin
    }
    return allowed.test(origin)
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply middleware to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip rate limiting for cron endpoints (they use secret auth)
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const origin = request.headers.get('origin')

  // Check rate limit
  const { allowed, remaining, resetIn } = checkRateLimit(ip)

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
          'Retry-After': Math.ceil(resetIn / 1000).toString(),
        },
      }
    )
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    if (isOriginAllowed(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin || '*'
    }

    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // Add rate limit and CORS headers to response
  const response = NextResponse.next()

  // Rate limit headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetIn / 1000).toString())

  // CORS headers
  if (isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
