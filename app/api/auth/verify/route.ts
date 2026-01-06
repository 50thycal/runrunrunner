import { NextRequest, NextResponse } from 'next/server'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

interface VerifyRequest {
  fid: number
  message: string
  signature: string
}

interface VerifiedUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  custodyAddress: string
  verifiedAt: string
}

function getNeynarClient(): NeynarAPIClient {
  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    throw new Error('NEYNAR_API_KEY is not set')
  }
  const config = new Configuration({ apiKey })
  return new NeynarAPIClient(config)
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json()
    const { fid, message, signature } = body

    if (!fid || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: fid, message, signature' },
        { status: 400 }
      )
    }

    // Validate FID from message matches provided FID
    const fidMatch = message.match(/farcaster:\/\/fid\/(\d+)/)
    const messageFid = fidMatch ? parseInt(fidMatch[1], 10) : null

    if (messageFid !== fid) {
      return NextResponse.json(
        { error: 'FID mismatch between message and request', valid: false },
        { status: 400 }
      )
    }

    const client = getNeynarClient()

    // Fetch and verify user exists in Neynar
    const userResponse = await client.fetchBulkUsers({ fids: [fid] })
    const user = userResponse.users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in Farcaster network', valid: false },
        { status: 404 }
      )
    }

    // User verified - return verified user data
    const verifiedUser: VerifiedUser = {
      fid: user.fid,
      username: user.username || '',
      displayName: user.display_name || '',
      pfpUrl: user.pfp_url || '',
      custodyAddress: user.custody_address || '',
      verifiedAt: new Date().toISOString(),
    }

    console.log(`[Auth] Verified user FID:${fid} (@${verifiedUser.username})`)

    return NextResponse.json({
      valid: true,
      user: verifiedUser,
    })
  } catch (error) {
    console.error('[Auth] Verification error:', error)

    if (error instanceof Error && error.message.includes('NEYNAR_API_KEY')) {
      return NextResponse.json(
        { error: 'Server configuration error - Neynar API key not configured', valid: false },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Verification failed', valid: false },
      { status: 500 }
    )
  }
}
