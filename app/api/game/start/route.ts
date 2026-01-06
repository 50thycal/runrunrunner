import { NextRequest, NextResponse } from 'next/server'
import { createGameSession, getContestDay, CONTEST_CONFIG, KVNotConfiguredError } from '@/lib/contest'

interface StartRequest {
  fid: number
}

export async function POST(request: NextRequest) {
  try {
    const body: StartRequest = await request.json()
    const { fid } = body

    if (!fid || typeof fid !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid fid' },
        { status: 400 }
      )
    }

    const sessionToken = await createGameSession(fid)

    return NextResponse.json({
      ok: true,
      sessionToken,
      contestDay: getContestDay(),
      config: {
        maxGamesPerHour: CONTEST_CONFIG.MAX_GAMES_PER_HOUR,
        sessionExpiryMs: CONTEST_CONFIG.SESSION_EXPIRY_MS,
      },
    })
  } catch (error) {
    console.error('[Game Start] Error:', error)

    if (error instanceof KVNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: 'KV_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to start game session' },
      { status: 500 }
    )
  }
}
