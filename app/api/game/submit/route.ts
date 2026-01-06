import { NextRequest, NextResponse } from 'next/server'
import { submitScore, KVNotConfiguredError } from '@/lib/contest'

interface SubmitRequest {
  sessionToken: string
  score: number
  fid: number
  username?: string
  displayName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequest = await request.json()
    const { sessionToken, score, fid, username, displayName } = body

    // Validate required fields
    if (!sessionToken || typeof sessionToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid sessionToken' },
        { status: 400 }
      )
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Missing or invalid score' },
        { status: 400 }
      )
    }

    if (!fid || typeof fid !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid fid' },
        { status: 400 }
      )
    }

    // Submit score
    const result = await submitScore(sessionToken, score, fid, username, displayName)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      rank: result.rank,
      message: result.rank && result.rank <= 3
        ? `You're currently #${result.rank}! Top 3 win ETH prizes.`
        : `Score submitted! Your rank: #${result.rank || 'unranked'}`,
    })
  } catch (error) {
    console.error('[Game Submit] Error:', error)

    if (error instanceof KVNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: 'KV_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to submit score' },
      { status: 500 }
    )
  }
}
