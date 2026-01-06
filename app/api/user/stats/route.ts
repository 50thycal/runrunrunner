import { NextRequest, NextResponse } from 'next/server'
import { getUserStats, CONTEST_CONFIG } from '@/lib/contest'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fidParam = searchParams.get('fid')

    if (!fidParam) {
      return NextResponse.json(
        { error: 'Missing fid parameter' },
        { status: 400 }
      )
    }

    const fid = parseInt(fidParam, 10)
    if (isNaN(fid)) {
      return NextResponse.json(
        { error: 'Invalid fid parameter' },
        { status: 400 }
      )
    }

    const stats = await getUserStats(fid)

    // Determine eligibility status
    const isEligible = stats.todayRank !== null && stats.todayRank <= 3
    const prizeAmount = isEligible
      ? CONTEST_CONFIG.PAYOUTS.find((p) => p.rank === stats.todayRank)?.amount
      : null

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        isEligible,
        prizeAmount,
        maxGamesPerHour: CONTEST_CONFIG.MAX_GAMES_PER_HOUR,
        gamesRemaining: Math.max(0, CONTEST_CONFIG.MAX_GAMES_PER_HOUR - stats.gamesPlayedToday),
      },
    })
  } catch (error) {
    console.error('[User Stats] Error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
