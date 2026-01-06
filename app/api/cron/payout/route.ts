import { NextRequest, NextResponse } from 'next/server'
import { executePayouts, getYesterdayContestDay } from '@/lib/contest'

/**
 * Payout cron endpoint
 *
 * Triggered by Vercel Cron at 00:05 UTC daily to pay out winners
 * from the previous day's contest.
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[Payout Cron] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Pay out yesterday's winners
    const contestDay = getYesterdayContestDay()
    console.log(`[Payout Cron] Processing payouts for ${contestDay}`)

    const result = await executePayouts(contestDay)

    console.log(`[Payout Cron] Completed: ${result.payouts.length} payouts, ${result.errors.length} errors`)

    return NextResponse.json({
      success: result.success,
      contestDay,
      payoutsProcessed: result.payouts.length,
      payouts: result.payouts.map((p) => ({
        fid: p.fid,
        rank: p.rank,
        amount: p.amount,
        txHash: p.txHash,
        status: p.status,
      })),
      errors: result.errors,
    })
  } catch (error) {
    console.error('[Payout Cron] Error:', error)

    return NextResponse.json(
      { error: 'Payout execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Manual payout trigger (admin only)
 *
 * POST /api/cron/payout
 * Body: { contestDay: "YYYY-MM-DD" }
 * Header: Authorization: Bearer CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const contestDay = body.contestDay

    if (!contestDay || !/^\d{4}-\d{2}-\d{2}$/.test(contestDay)) {
      return NextResponse.json(
        { error: 'Invalid contestDay format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    console.log(`[Payout Manual] Processing payouts for ${contestDay}`)

    const result = await executePayouts(contestDay)

    return NextResponse.json({
      success: result.success,
      contestDay,
      payoutsProcessed: result.payouts.length,
      payouts: result.payouts,
      errors: result.errors,
    })
  } catch (error) {
    console.error('[Payout Manual] Error:', error)

    return NextResponse.json(
      { error: 'Payout execution failed' },
      { status: 500 }
    )
  }
}
