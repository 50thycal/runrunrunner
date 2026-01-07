import { kv } from '@vercel/kv'

export interface AuthSession {
  fid: number
  verifiedAt: number
  expiresAt: number
}

/**
 * Verify an auth token and return the session if valid
 */
export async function verifyAuthToken(authToken: string | null): Promise<AuthSession | null> {
  if (!authToken) return null

  try {
    const session = await kv.get<AuthSession>(`auth:${authToken}`)
    if (!session) return null

    if (Date.now() > session.expiresAt) {
      await kv.del(`auth:${authToken}`)
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Extract auth token from request headers
 */
export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}
