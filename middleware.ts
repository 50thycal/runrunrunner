import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Rate limit configuration
const RATE_LIMIT_WINDOW_SECONDS = 60 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute per IP (reduced from 100)

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://warpcast.com',
  'https://www.warpcast.com',
  /^https:\/\/.*\.farcaster\.xyz$/,
  /^https:\/\/.*\.warpcast\.com$/,
]

/**
 * Get the real client IP from trusted Vercel headers
 * SECURITY: Only trust Vercel's x-forwarded-for header, not arbitrary headers
 */
function getClientIp(request: NextRequest): string {
  // On Vercel, x-forwarded-for is set by Vercel's edge and can be trusted
  // The leftmost IP is the original client IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first (leftmost) IP - this is the original client
    const clientIp = forwardedFor.split(',')[0].trim()
    // Validate it looks like an IP address
    if (/^[\d.:a-fA-F]+$/.test(clientIp)) {
      return clientIp
    }
  }

  // Vercel also sets x-real-ip
  const realIp = request.headers.get('x-real-ip')
  if (realIp && /^[\d.:a-fA-F]+$/.test(realIp)) {
    return realIp
  }

  // Fallback - use a hash of other identifying info
  const ua = request.headers.get('user-agent') || ''
  return `unknown-${hashString(ua).substring(0, 8)}`
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

/**
 * Distributed rate limiting using Vercel KV
 * Uses a sliding window approach
 */
async function checkRateLimitDistributed(ip: string): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `ratelimit:${ip}`

  try {
    // Use INCR with EXPIRE for atomic rate limiting
    const count = await kv.incr(key)

    // Set expiry only on first request (when count is 1)
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS)
    }

    // Get TTL for reset time
    const ttl = await kv.ttl(key)
    const resetIn = ttl > 0 ? ttl * 1000 : RATE_LIMIT_WINDOW_SECONDS * 1000

    if (count > RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetIn }
    }

    return {
      allowed: true,
      remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - count),
      resetIn,
    }
  } catch (error) {
    // If KV fails, allow the request but log the error
    console.error('[RateLimit] KV error:', error)
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, resetIn: RATE_LIMIT_WINDOW_SECONDS * 1000 }
  }
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply middleware to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip rate limiting for cron endpoints (they use secret auth)
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next()
  }

  // Skip rate limiting for health check
  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const origin = request.headers.get('origin')

  // Check distributed rate limit
  const { allowed, remaining, resetIn } = await checkRateLimitDistributed(ip)

  if (!allowed) {
    console.log(`[RateLimit] Blocked IP: ${ip}, path: ${pathname}`)
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
