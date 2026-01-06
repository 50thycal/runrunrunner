import { kv } from '@vercel/kv'
import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// ============================================================================
// KV Availability Check
// ============================================================================

export function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

export class KVNotConfiguredError extends Error {
  constructor() {
    super('KV_NOT_CONFIGURED')
    this.name = 'KVNotConfiguredError'
  }
}

function requireKV(): void {
  if (!isKVConfigured()) {
    throw new KVNotConfiguredError()
  }
}

// ============================================================================
// Types
// ============================================================================

export interface GameSession {
  fid: number
  startTime: number
  used: boolean
  expiresAt: number
}

export interface ScoreEntry {
  fid: number
  score: number
  username?: string
  displayName?: string
  submittedAt: number
  sessionToken: string
  duration: number
}

export interface LeaderboardEntry {
  rank: number
  fid: number
  score: number
  username?: string
  displayName?: string
}

export interface PayoutRecord {
  fid: number
  rank: number
  amount: string // ETH amount as string
  txHash: string
  walletAddress: string
  contestDay: string
  paidAt: number
  status: 'pending' | 'success' | 'failed'
  error?: string
}

export interface UserStats {
  fid: number
  todayBestScore: number | null
  todayRank: number | null
  gamesPlayedToday: number
  payouts: PayoutRecord[]
}

// ============================================================================
// Constants
// ============================================================================

export const CONTEST_CONFIG = {
  // Payout amounts in ETH (test scale ~$0.05, $0.03, $0.02)
  PAYOUTS: [
    { rank: 1, amount: '0.00002' }, // ~$0.05 at $2500/ETH
    { rank: 2, amount: '0.000012' }, // ~$0.03
    { rank: 3, amount: '0.000008' }, // ~$0.02
  ],
  // Anti-cheat
  SESSION_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  MAX_GAMES_PER_HOUR: 10,
  MIN_RUN_DURATION_MS: 3000, // Minimum 3 seconds to submit
  SCORE_DURATION_RATIO: 100, // Score ≈ duration_ms / 100
  SCORE_TOLERANCE: 0.3, // Allow 30% variance from expected score
  // Safety
  DAILY_PAYOUT_CAP_ETH: '0.001', // Max 0.001 ETH per day total
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get current contest day in YYYY-MM-DD format (UTC)
 */
export function getContestDay(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get yesterday's contest day
 */
export function getYesterdayContestDay(): string {
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  return getContestDay(yesterday)
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

/**
 * Validate that score correlates with duration
 * Note: Duration from server includes session creation overhead, so we need generous tolerance
 */
export function validateScoreDuration(score: number, durationMs: number): boolean {
  console.log(`[Validate] score=${score}, durationMs=${durationMs}`)

  // Minimum duration check (but be lenient - 1 second minimum)
  if (durationMs < 1000) {
    console.log(`[Validate] FAIL - duration too short (${durationMs}ms < 1000ms)`)
    return false
  }

  // Expected score = duration / 100 (game loop divides elapsed by 100)
  const expectedScore = Math.floor(durationMs / CONTEST_CONFIG.SCORE_DURATION_RATIO)

  // Very generous tolerance: 50% variance OR at least 50 points
  // This accounts for network latency, session creation delay, etc.
  const minTolerance = 50
  const percentTolerance = expectedScore * 0.5
  const tolerance = Math.max(minTolerance, percentTolerance)

  const diff = Math.abs(score - expectedScore)
  const isValid = diff <= tolerance

  console.log(`[Validate] expected=${expectedScore}, tolerance=${tolerance}, diff=${diff}, valid=${isValid}`)

  return isValid
}

// ============================================================================
// KV Storage Keys
// ============================================================================

const keys = {
  session: (token: string) => `session:${token}`,
  scores: (contestDay: string) => `scores:${contestDay}`,
  scoreEntry: (contestDay: string, fid: number) => `score:${contestDay}:${fid}`,
  userBest: (fid: number, contestDay: string) => `user:${fid}:best:${contestDay}`,
  userGames: (fid: number, contestDay: string) => `user:${fid}:games:${contestDay}`,
  payout: (contestDay: string, fid: number) => `payout:${contestDay}:${fid}`,
  payoutsDone: (contestDay: string) => `payouts_done:${contestDay}`,
  dailyPayoutTotal: (contestDay: string) => `payout_total:${contestDay}`,
}

// ============================================================================
// Session Management
// ============================================================================

export async function createGameSession(fid: number): Promise<string> {
  requireKV()
  const contestDay = getContestDay()
  const gamesKey = keys.userGames(fid, contestDay)

  // Check rate limit
  const gamesPlayed = await kv.get<number>(gamesKey) || 0
  if (gamesPlayed >= CONTEST_CONFIG.MAX_GAMES_PER_HOUR) {
    throw new Error('Rate limit exceeded. Maximum 10 games per hour.')
  }

  // Create session
  const token = generateSessionToken()
  const session: GameSession = {
    fid,
    startTime: Date.now(),
    used: false,
    expiresAt: Date.now() + CONTEST_CONFIG.SESSION_EXPIRY_MS,
  }

  await kv.set(keys.session(token), session, {
    ex: Math.ceil(CONTEST_CONFIG.SESSION_EXPIRY_MS / 1000),
  })

  // Increment game count (expires in 1 hour)
  await kv.incr(gamesKey)
  await kv.expire(gamesKey, 3600)

  return token
}

export async function getGameSession(token: string): Promise<GameSession | null> {
  requireKV()
  return kv.get<GameSession>(keys.session(token))
}

export async function invalidateSession(token: string): Promise<void> {
  const session = await getGameSession(token)
  if (session) {
    session.used = true
    await kv.set(keys.session(token), session, {
      ex: 60, // Keep for 1 minute after use for debugging
    })
  }
}

// ============================================================================
// Score Management
// ============================================================================

export async function submitScore(
  token: string,
  score: number,
  fid: number,
  username?: string,
  displayName?: string
): Promise<{ success: boolean; error?: string; rank?: number }> {
  requireKV()
  // Validate session
  const session = await getGameSession(token)

  if (!session) {
    return { success: false, error: 'Invalid or expired session' }
  }

  if (session.fid !== fid) {
    return { success: false, error: 'Session FID mismatch' }
  }

  if (session.used) {
    return { success: false, error: 'Session already used' }
  }

  if (Date.now() > session.expiresAt) {
    return { success: false, error: 'Session expired' }
  }

  // Validate score vs duration
  const duration = Date.now() - session.startTime
  if (!validateScoreDuration(score, duration)) {
    return { success: false, error: 'Score does not match play duration' }
  }

  // Invalidate session (single-use)
  await invalidateSession(token)

  const contestDay = getContestDay()
  const scoresKey = keys.scores(contestDay)
  const userBestKey = keys.userBest(fid, contestDay)

  // Check if user already has a better score today
  const existingBest = await kv.get<number>(userBestKey)
  if (existingBest !== null && existingBest >= score) {
    // Don't update, but still count as successful submission
    const rank = await getUserRank(fid, contestDay)
    return { success: true, rank: rank ?? undefined }
  }

  // Store/update score in sorted set
  const entry: ScoreEntry = {
    fid,
    score,
    username,
    displayName,
    submittedAt: Date.now(),
    sessionToken: token,
    duration,
  }

  // Use fid as the member for consistent add/remove
  const fidStr = fid.toString()

  console.log(`[Submit] About to zadd: key=${scoresKey}, score=${score}, member=${fidStr}, memberType=${typeof fidStr}`)

  // Remove old score if exists, then add new one
  await kv.zrem(scoresKey, fidStr)

  // Use explicit object format for zadd
  const zaddResult = await kv.zadd(scoresKey, { score: score, member: fidStr })
  console.log(`[Submit] zadd result: ${zaddResult}`)

  // Verify what was stored
  const storedRank = await kv.zrevrank(scoresKey, fidStr)
  console.log(`[Submit] Verification - zrevrank for ${fidStr}: ${storedRank}`)

  // Store entry details separately (for leaderboard display)
  const entryKey = keys.scoreEntry(contestDay, fid)
  await kv.set(entryKey, entry, { ex: 86400 * 2 }) // Expire in 2 days

  // Update user's best score
  await kv.set(userBestKey, score, { ex: 86400 * 2 }) // Expire in 2 days

  console.log(`[Submit] Stored score for fid=${fid}, score=${score}, key=${scoresKey}`)

  // Get rank
  const rank = await getUserRank(fid, contestDay)

  return { success: true, rank: rank ?? undefined }
}

// ============================================================================
// Leaderboard
// ============================================================================

export async function getLeaderboard(contestDay?: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  requireKV()
  const day = contestDay || getContestDay()
  const scoresKey = keys.scores(day)

  console.log(`[Leaderboard] Fetching from key=${scoresKey}`)

  // Get top scores (highest first) - returns [member, score, member, score, ...]
  const results = await kv.zrange(scoresKey, 0, limit - 1, { rev: true, withScores: true })

  console.log(`[Leaderboard] Raw results count: ${results.length}`)
  console.log(`[Leaderboard] Raw results:`, JSON.stringify(results))

  const entries: LeaderboardEntry[] = []
  for (let i = 0; i < results.length; i += 2) {
    const rawMember = results[i]
    const rawScore = results[i + 1]

    console.log(`[Leaderboard] Entry ${i/2}: rawMember=${JSON.stringify(rawMember)}, rawScore=${rawScore}, memberType=${typeof rawMember}`)

    // Handle member - could be string or object depending on how it was stored
    let fidStr: string
    if (typeof rawMember === 'string') {
      fidStr = rawMember
    } else if (typeof rawMember === 'object' && rawMember !== null) {
      // If it's an object (e.g., from old buggy zadd), try to extract fid
      const obj = rawMember as Record<string, unknown>
      if ('fid' in obj && typeof obj.fid === 'number') {
        fidStr = obj.fid.toString()
      } else {
        console.log(`[Leaderboard] Skipping corrupt entry (object without fid): ${JSON.stringify(rawMember)}`)
        continue
      }
    } else {
      console.log(`[Leaderboard] Skipping unknown member type: ${typeof rawMember}`)
      continue
    }

    const score = typeof rawScore === 'number' ? rawScore : parseFloat(String(rawScore))
    const fid = parseInt(fidStr, 10)

    if (isNaN(fid)) {
      console.log(`[Leaderboard] Skipping invalid fid: ${fidStr}`)
      continue
    }

    // Fetch entry details from separate key
    const entryKey = keys.scoreEntry(day, fid)
    const entry = await kv.get<ScoreEntry>(entryKey)

    entries.push({
      rank: Math.floor(i / 2) + 1,
      fid,
      score,
      username: entry?.username,
      displayName: entry?.displayName,
    })
  }

  console.log(`[Leaderboard] Returning ${entries.length} entries`)
  return entries
}

export async function getUserRank(fid: number, contestDay?: string): Promise<number | null> {
  requireKV()
  const day = contestDay || getContestDay()
  const scoresKey = keys.scores(day)

  // ZREVRANK returns 0-based rank (0 = highest score)
  const rank = await kv.zrevrank(scoresKey, fid.toString())

  console.log(`[Rank] fid=${fid}, key=${scoresKey}, zrevrank=${rank}`)

  if (rank === null || rank === undefined) {
    return null
  }

  // Convert to 1-based rank
  return rank + 1
}

export async function getUserStats(fid: number): Promise<UserStats> {
  requireKV()
  const contestDay = getContestDay()

  const [todayBestScore, gamesPlayedToday] = await Promise.all([
    kv.get<number>(keys.userBest(fid, contestDay)),
    kv.get<number>(keys.userGames(fid, contestDay)),
  ])

  const todayRank = todayBestScore ? await getUserRank(fid, contestDay) : null

  // Get recent payouts (last 7 days)
  const payouts: PayoutRecord[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - i)
    const day = getContestDay(date)
    const payout = await kv.get<PayoutRecord>(keys.payout(day, fid))
    if (payout) {
      payouts.push(payout)
    }
  }

  return {
    fid,
    todayBestScore: todayBestScore || null,
    todayRank,
    gamesPlayedToday: gamesPlayedToday || 0,
    payouts,
  }
}

// ============================================================================
// Wallet Resolution
// ============================================================================

export async function resolveWalletAddress(fid: number): Promise<string | null> {
  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    console.error('[Payout] NEYNAR_API_KEY not set')
    return null
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': apiKey,
        },
      }
    )

    if (!response.ok) {
      console.error('[Payout] Failed to fetch user:', response.status)
      return null
    }

    const data = await response.json()
    const user = data.users?.[0]

    if (!user) {
      return null
    }

    // Priority: verified addresses > connected addresses > custody address
    // Check verified addresses first
    if (user.verified_addresses?.eth_addresses?.length > 0) {
      return user.verified_addresses.eth_addresses[0]
    }

    // Check connected addresses (from profile)
    if (user.verified_addresses?.primary_address) {
      return user.verified_addresses.primary_address
    }

    // Fall back to custody address
    if (user.custody_address) {
      return user.custody_address
    }

    return null
  } catch (error) {
    console.error('[Payout] Error resolving wallet:', error)
    return null
  }
}

// ============================================================================
// Payout Execution
// ============================================================================

export async function executePayouts(contestDay: string): Promise<{
  success: boolean
  payouts: PayoutRecord[]
  errors: string[]
}> {
  const errors: string[] = []
  const payouts: PayoutRecord[] = []

  // Check if payouts already done for this day
  const payoutsDoneKey = keys.payoutsDone(contestDay)
  const alreadyDone = await kv.get<boolean>(payoutsDoneKey)
  if (alreadyDone) {
    return { success: true, payouts: [], errors: ['Payouts already executed for this day'] }
  }

  // Get wallet private key
  const privateKey = process.env.PAYOUT_WALLET_PRIVATE_KEY
  if (!privateKey) {
    return { success: false, payouts: [], errors: ['PAYOUT_WALLET_PRIVATE_KEY not configured'] }
  }

  // Get leaderboard
  const leaderboard = await getLeaderboard(contestDay, 3)
  if (leaderboard.length === 0) {
    await kv.set(payoutsDoneKey, true, { ex: 86400 * 7 })
    return { success: true, payouts: [], errors: ['No scores for this day'] }
  }

  // Check daily cap
  const dailyTotalKey = keys.dailyPayoutTotal(contestDay)
  const currentTotal = parseFloat((await kv.get<string>(dailyTotalKey)) || '0')
  const cap = parseFloat(CONTEST_CONFIG.DAILY_PAYOUT_CAP_ETH)

  if (currentTotal >= cap) {
    return { success: false, payouts: [], errors: ['Daily payout cap reached'] }
  }

  // Set up wallet client
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  })
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  })

  // Process each winner
  for (const winner of leaderboard) {
    const payoutConfig = CONTEST_CONFIG.PAYOUTS.find((p) => p.rank === winner.rank)
    if (!payoutConfig) continue

    // Check if already paid
    const payoutKey = keys.payout(contestDay, winner.fid)
    const existingPayout = await kv.get<PayoutRecord>(payoutKey)
    if (existingPayout?.status === 'success') {
      payouts.push(existingPayout)
      continue
    }

    // Resolve wallet address
    const walletAddress = await resolveWalletAddress(winner.fid)
    if (!walletAddress) {
      errors.push(`Could not resolve wallet for FID ${winner.fid}`)
      continue
    }

    // Check cap
    const newTotal = currentTotal + parseFloat(payoutConfig.amount)
    if (newTotal > cap) {
      errors.push('Would exceed daily cap, stopping payouts')
      break
    }

    // Create payout record
    const payoutRecord: PayoutRecord = {
      fid: winner.fid,
      rank: winner.rank,
      amount: payoutConfig.amount,
      txHash: '',
      walletAddress,
      contestDay,
      paidAt: Date.now(),
      status: 'pending',
    }

    try {
      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: walletAddress as `0x${string}`,
        value: parseEther(payoutConfig.amount),
      })

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      payoutRecord.txHash = hash
      payoutRecord.status = receipt.status === 'success' ? 'success' : 'failed'

      if (receipt.status === 'success') {
        // Update daily total
        await kv.set(dailyTotalKey, (newTotal).toString(), { ex: 86400 * 7 })
      }
    } catch (error) {
      payoutRecord.status = 'failed'
      payoutRecord.error = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Failed to pay FID ${winner.fid}: ${payoutRecord.error}`)
    }

    // Save payout record
    await kv.set(payoutKey, payoutRecord, { ex: 86400 * 30 }) // Keep for 30 days
    payouts.push(payoutRecord)
  }

  // Mark payouts as done
  await kv.set(payoutsDoneKey, true, { ex: 86400 * 7 })

  return { success: errors.length === 0, payouts, errors }
}
