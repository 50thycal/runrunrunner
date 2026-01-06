import { NextRequest, NextResponse } from 'next/server'
import { createGameSession, getContestDay, CONTEST_CONFIG } from '@/lib/contest'

interface StartRequest {
  fid: number
}

export async function POST(request: NextRequest) {
  try {
    const body: StartRequest = await request.json()
    const { fid } = body

    if (!fid || typeof fid !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid fid' },
        { status: 400 }
      )
    }

    const sessionToken = await createGameSession(fid)

    return NextResponse.json({
      success: true,
      sessionToken,
      contestDay: getContestDay(),
      config: {
        maxGamesPerHour: CONTEST_CONFIG.MAX_GAMES_PER_HOUR,
        sessionExpiryMs: CONTEST_CONFIG.SESSION_EXPIRY_MS,
      },
    })
  } catch (error) {
    console.error('[Game Start] Error:', error)

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to start game session' },
      { status: 500 }
    )
  }
}
