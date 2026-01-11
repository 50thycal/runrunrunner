import { NextRequest, NextResponse } from 'next/server'
import { getUserStats, getUserAllTimeBest, CONTEST_CONFIG, KVNotConfiguredError } from '@/lib/contest'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fidParam = searchParams.get('fid')

    if (!fidParam) {
      return NextResponse.json(
        { ok: false, error: 'Missing fid parameter' },
        { status: 400 }
      )
    }

    const fid = parseInt(fidParam, 10)
    if (isNaN(fid)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid fid parameter' },
        { status: 400 }
      )
    }

    const [stats, allTimeBest] = await Promise.all([
      getUserStats(fid),
      getUserAllTimeBest(fid),
    ])

    // Determine eligibility status
    const isEligible = stats.todayRank !== null && stats.todayRank <= 3
    const prizeAmount = isEligible
      ? CONTEST_CONFIG.PAYOUTS.find((p) => p.rank === stats.todayRank)?.amount
      : null

    return NextResponse.json({
      ok: true,
      stats: {
        ...stats,
        allTimeBest,
        isEligible,
        prizeAmount,
        maxGamesPerHour: CONTEST_CONFIG.MAX_GAMES_PER_HOUR,
        gamesRemaining: Math.max(0, CONTEST_CONFIG.MAX_GAMES_PER_HOUR - stats.gamesPlayedToday),
      },
    })
  } catch (error) {
    console.error('[User Stats] Error:', error)

    if (error instanceof KVNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: 'KV_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
