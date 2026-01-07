'use client'

import { useCallback, useEffect, useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'

interface User {
  fid: number
  address: string
  username?: string
  displayName?: string
  pfpUrl?: string
  signature?: string
  message?: string
  verified: boolean
  verifiedAt?: string
  authToken?: string // Server-issued auth token for authenticated requests
}

function generateNonce(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

async function verifyWithServer(fid: number, message: string, signature: string, nonce: string): Promise<{
  valid: boolean
  user?: {
    fid: number
    username: string
    displayName: string
    pfpUrl: string
    verifiedAt: string
  }
  authToken?: string
  error?: string
}> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid, message, signature, nonce }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { valid: false, error: data.error || 'Verification failed' }
    }

    return { valid: true, user: data.user, authToken: data.authToken }
  } catch (error) {
    console.error('Verification request failed:', error)
    return { valid: false, error: 'Network error during verification' }
  }
}

export function useAuthSession() {
  const [status, setStatus] = useState<'loading' | 'signedOut' | 'signedIn'>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null)

  // CRITICAL: Signal to Farcaster that app is ready
  useEffect(() => {
    sdk.actions.ready()

    sdk.isInMiniApp().then((inMiniApp) => {
      setIsInMiniApp(inMiniApp)
      if (!inMiniApp) {
        setStatus('signedOut')
      }
    })
  }, [])

  // When in miniapp, require explicit sign-in for verification
  useEffect(() => {
    if (isInMiniApp === false) {
      setStatus('signedOut')
      return
    }

    if (isInMiniApp === null) {
      return
    }

    // In miniapp - require explicit sign-in for server verification
    setStatus('signedOut')
  }, [isInMiniApp])

  const signIn = useCallback(async () => {
    if (isInMiniApp === false) {
      setError('Sign-in only works when this app is opened as a Farcaster Mini App.')
      return
    }

    try {
      setStatus('loading')
      setError(null)

      const nonce = generateNonce(16)
      const result = await sdk.actions.signIn({
        nonce,
        acceptAuthAddress: true,
      })

      if (!result || !result.signature || !result.message) {
        throw new Error('Invalid sign-in response from host')
      }

      // Parse FID from message
      const fidMatch = result.message.match(/farcaster:\/\/fid\/(\d+)/)
      const fid = fidMatch?.[1]

      if (!fid) {
        throw new Error('Could not parse FID from sign-in message')
      }

      const parsedFid = Number.parseInt(fid, 10)

      // Parse address from message
      let addressMatch = result.message.match(/account:\s*(0x[a-fA-F0-9]{40})/)
      if (!addressMatch) {
        addressMatch = result.message.match(/^(0x[a-fA-F0-9]{40})\s*$/m)
      }
      const address = addressMatch?.[1] || ''

      // Verify with server (pass nonce for replay attack prevention)
      const verification = await verifyWithServer(parsedFid, result.message, result.signature, nonce)

      if (!verification.valid || !verification.authToken) {
        // Verification failed - don't allow sign-in without valid auth token
        console.warn('Server verification failed:', verification.error)
        throw new Error(verification.error || 'Server verification failed')
      }

      // Use verified data from server with auth token
      setUser({
        fid: verification.user!.fid,
        address,
        username: verification.user!.username,
        displayName: verification.user!.displayName,
        pfpUrl: verification.user!.pfpUrl,
        signature: result.signature,
        message: result.message,
        verified: true,
        verifiedAt: verification.user!.verifiedAt,
        authToken: verification.authToken,
      })

      setStatus('signedIn')
    } catch (err) {
      console.error('Sign-in error:', err)
      setError(err instanceof Error ? err.message : 'Sign-in failed')
      setStatus('signedOut')
    }
  }, [isInMiniApp])

  const signOut = useCallback(() => {
    setUser(null)
    setStatus('signedOut')
    setError(null)
  }, [])

  return {
    status,
    user,
    error,
    isInMiniApp: isInMiniApp ?? false,
    signIn,
    signOut,
  }
}
