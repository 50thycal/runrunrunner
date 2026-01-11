'use client'

import { useCallback, useEffect, useState } from 'react'

interface UserStats {
  todayBestScore: number | null
  todayRank: number | null
  gamesPlayedToday: number
  isEligible: boolean
  prizeAmount: string | null
  gamesRemaining: number
  allTimeBest: number | null
  payouts: Array<{
    contestDay: string
    rank: number
    amount: string
    txHash: string
    status: string
  }>
}

interface LobbyProps {
  username?: string
  displayName?: string
  pfpUrl?: string
  verified: boolean
  fid: number
  bestScore: number
  onPlay: () => void
  onSignOut: () => void
  onShowLeaderboard: () => void
}

export function Lobby({
  username,
  displayName,
  pfpUrl,
  verified,
  fid,
  bestScore,
  onPlay,
  onSignOut,
  onShowLeaderboard,
}: LobbyProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [countdown, setCountdown] = useState('')

  // Calculate time until next payout (00:05 UTC daily)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const nextPayout = new Date(now)
      nextPayout.setUTCHours(0, 5, 0, 0)

      // If we're past today's payout, set to tomorrow
      if (now.getTime() > nextPayout.getTime()) {
        nextPayout.setUTCDate(nextPayout.getUTCDate() + 1)
      }

      const diff = nextPayout.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true)
      const response = await fetch(`/api/user/stats?fid=${fid}`)
      const data = await response.json()
      if (response.ok && data.stats) {
        setStats(data.stats)
      } else if (data.error === 'KV_NOT_CONFIGURED') {
        // KV not configured - stats unavailable but game can still attempt to play
        // (will show proper error when trying to start)
        console.warn('Stats unavailable: KV not configured')
        setStats(null)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats(null)
    } finally {
      setLoadingStats(false)
    }
  }, [fid])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>runrunrunner</h1>
      </div>

      {/* User info */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
        }}
      >
        {pfpUrl ? (
          <img
            src={pfpUrl}
            alt="Profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #8b5cf6',
            }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            {(displayName || username || '?')[0].toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {displayName || `@${username}` || 'Player'}
          </div>
          {username && displayName && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>@{username}</div>
          )}
        </div>
        {verified && (
          <div
            style={{
              marginLeft: 8,
              padding: '4px 8px',
              backgroundColor: '#22c55e',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            VERIFIED
          </div>
        )}
      </div>

      {/* Play button */}
      <button
        onClick={onPlay}
        style={{
          marginTop: 24,
          padding: '20px 64px',
          fontSize: 28,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          backgroundColor: '#8b5cf6',
          color: '#fff',
          border: 'none',
          borderRadius: 40,
          cursor: 'pointer',
          transition: 'transform 0.1s, box-shadow 0.1s',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        PLAY
      </button>

      {/* All Time High Score */}
      {stats?.allTimeBest && stats.allTimeBest > 0 && (
        <div
          style={{
            marginTop: 16,
            textAlign: 'center',
            padding: '12px 24px',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderRadius: 8,
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>
            All Time High Score
          </div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fbbf24', marginTop: 4 }}>
            {stats.allTimeBest}
          </div>
        </div>
      )}

      {/* Contest info box */}
      <div
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderRadius: 12,
          maxWidth: 320,
          width: '100%',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
          🏆 Daily Contest
        </div>

        <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
          Top 3 daily scores win ETH on Base L2:
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>🥇</div>
            <div style={{ fontSize: 11, color: '#fbbf24' }}>~$0.06</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>🥈</div>
            <div style={{ fontSize: 11, color: '#c0c0c0' }}>~$0.03</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>🥉</div>
            <div style={{ fontSize: 11, color: '#cd7f32' }}>~$0.01</div>
          </div>
        </div>

        {!loadingStats && stats && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
            {stats.todayRank !== null ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Today's rank</div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: stats.todayRank <= 3 ? '#fbbf24' : '#fff',
                }}>
                  #{stats.todayRank}
                </div>
                {stats.isEligible && (
                  <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>
                    Prize eligible!
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.7 }}>
                Play to get on the leaderboard!
              </div>
            )}

            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6, textAlign: 'center' }}>
              Games remaining: {stats.gamesRemaining}/10 this hour
            </div>
          </div>
        )}

        <button
          onClick={onShowLeaderboard}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '10px',
            fontSize: 12,
            fontFamily: 'monospace',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          View Leaderboard
        </button>

        {/* Payout countdown */}
        <div
          style={{
            marginTop: 12,
            padding: '10px',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderRadius: 6,
            border: '1px solid rgba(251, 191, 36, 0.3)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7 }}>Next payout in</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fbbf24',
              fontFamily: 'monospace',
              marginTop: 4,
            }}
          >
            {countdown}
          </div>
        </div>
      </div>

      {/* Recent payouts */}
      {stats?.payouts && stats.payouts.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 8,
            maxWidth: 320,
            width: '100%',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
            Recent Winnings
          </div>
          {stats.payouts.slice(0, 3).map((payout, i) => (
            <div key={i} style={{ fontSize: 11, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>{payout.contestDay} (#{payout.rank})</span>
              <a
                href={`https://basescan.org/tx/${payout.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#22c55e' }}
                onClick={(e) => e.stopPropagation()}
              >
                {payout.amount} ETH ↗
              </a>
            </div>
          ))}
        </div>
      )}

      {/* How to play (collapsed) */}
      <details
        style={{
          marginTop: 20,
          padding: '12px 16px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          maxWidth: 320,
          width: '100%',
        }}
      >
        <summary style={{ fontSize: 14, cursor: 'pointer' }}>How to Play</summary>
        <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
          <p style={{ margin: '8px 0' }}>1. Auto-run on floor or ceiling lane</p>
          <p style={{ margin: '8px 0' }}>2. <strong>Tap</strong> or <strong>SPACE</strong> to flip lanes</p>
          <p style={{ margin: '8px 0' }}>3. Avoid <span style={{ color: '#e74c3c' }}>red obstacles</span></p>
          <p style={{ margin: '8px 0' }}>4. Survive longer = higher score!</p>
        </div>
      </details>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        style={{
          marginTop: 16,
          padding: '8px 16px',
          fontSize: 12,
          fontFamily: 'monospace',
          backgroundColor: 'transparent',
          color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Sign Out
      </button>

    </div>
  )
}
