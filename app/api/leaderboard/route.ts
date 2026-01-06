import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard, getContestDay, CONTEST_CONFIG } from '@/lib/contest'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const day = searchParams.get('day') || getContestDay()
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100)

    const leaderboard = await getLeaderboard(day, limit)

    // Add prize info to top 3
    const withPrizes = leaderboard.map((entry) => ({
      ...entry,
      prize: CONTEST_CONFIG.PAYOUTS.find((p) => p.rank === entry.rank)?.amount || null,
    }))

    return NextResponse.json({
      success: true,
      contestDay: day,
      leaderboard: withPrizes,
      prizes: CONTEST_CONFIG.PAYOUTS,
    })
  } catch (error) {
    console.error('[Leaderboard] Error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
