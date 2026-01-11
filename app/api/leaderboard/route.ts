import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard, getAllTimeLeaderboard, getContestDay, CONTEST_CONFIG, KVNotConfiguredError } from '@/lib/contest'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'daily'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100)

    if (type === 'alltime') {
      const leaderboard = await getAllTimeLeaderboard(limit)
      return NextResponse.json({
        ok: true,
        type: 'alltime',
        leaderboard,
      })
    }

    // Daily leaderboard (default)
    const day = searchParams.get('day') || getContestDay()
    const leaderboard = await getLeaderboard(day, limit)

    // Add prize info to top 3
    const withPrizes = leaderboard.map((entry) => ({
      ...entry,
      prize: CONTEST_CONFIG.PAYOUTS.find((p) => p.rank === entry.rank)?.amount || null,
    }))

    return NextResponse.json({
      ok: true,
      type: 'daily',
      contestDay: day,
      leaderboard: withPrizes,
      prizes: CONTEST_CONFIG.PAYOUTS,
    })
  } catch (error) {
    console.error('[Leaderboard] Error:', error)

    if (error instanceof KVNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: 'KV_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
