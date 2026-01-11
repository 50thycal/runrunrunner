'use client'

import { useCallback, useEffect, useState } from 'react'

interface LeaderboardEntry {
  rank: number
  fid: number
  score: number
  username?: string
  displayName?: string
  prize?: string | null
}

interface Prize {
  rank: number
  amount: string
}

type LeaderboardType = 'daily' | 'alltime'

interface LeaderboardProps {
  fid: number
  onClose: () => void
}

export function Leaderboard({ fid, onClose }: LeaderboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [contestDay, setContestDay] = useState<string>('')
  const [userRank, setUserRank] = useState<number | null>(null)
  const [viewType, setViewType] = useState<LeaderboardType>('daily')

  const fetchLeaderboard = useCallback(async (type: LeaderboardType) => {
    try {
      setLoading(true)
      setError(null)

      const url = type === 'alltime'
        ? '/api/leaderboard?type=alltime&limit=20'
        : '/api/leaderboard?limit=20'

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      setLeaderboard(data.leaderboard)
      setPrizes(data.prizes || [])
      setContestDay(data.contestDay || '')

      // Find user's rank
      const userEntry = data.leaderboard.find((e: LeaderboardEntry) => e.fid === fid)
      setUserRank(userEntry?.rank || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [fid])

  useEffect(() => {
    fetchLeaderboard(viewType)
  }, [fetchLeaderboard, viewType])

  const formatPrize = (amount: string) => {
    const eth = parseFloat(amount)
    if (eth >= 0.001) {
      return `${eth} ETH`
    }
    return `${(eth * 1000).toFixed(3)} mETH`
  }

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
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>Leaderboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>
            {viewType === 'daily' ? `${contestDay} (UTC)` : 'All Time Best Scores'}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            fontFamily: 'monospace',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* Toggle */}
      <div
        style={{
          display: 'flex',
          padding: '12px 20px',
          gap: 8,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={() => setViewType('daily')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: 13,
            fontFamily: 'monospace',
            fontWeight: viewType === 'daily' ? 'bold' : 'normal',
            backgroundColor: viewType === 'daily' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Daily
        </button>
        <button
          onClick={() => setViewType('alltime')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: 13,
            fontFamily: 'monospace',
            fontWeight: viewType === 'alltime' ? 'bold' : 'normal',
            backgroundColor: viewType === 'alltime' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          All Time
        </button>
      </div>

      {/* Prize info - only for daily */}
      {viewType === 'daily' && (
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
            Daily prizes (Base L2):
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {prizes.map((prize) => (
              <div key={prize.rank} style={{ fontSize: 12 }}>
                <span style={{ color: '#fbbf24' }}>#{prize.rank}</span>
                <span style={{ marginLeft: 4 }}>{formatPrize(prize.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User rank highlight */}
      {userRank && (
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: userRank <= 3 && viewType === 'daily' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>
            Your rank: <strong style={{ color: userRank <= 3 ? '#fbbf24' : '#fff' }}>#{userRank}</strong>
            {userRank <= 3 && viewType === 'daily' && <span style={{ marginLeft: 8 }}>🏆 Prize eligible!</span>}
          </p>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', opacity: 0.7 }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{ padding: 40, textAlign: 'center', color: '#e74c3c' }}>
            {error}
            <button
              onClick={() => fetchLeaderboard(viewType)}
              style={{
                display: 'block',
                margin: '16px auto 0',
                padding: '8px 16px',
                fontSize: 12,
                fontFamily: 'monospace',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', opacity: 0.7 }}>
            No scores yet today. Be the first!
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div style={{ paddingTop: 12 }}>
            {leaderboard.map((entry) => (
              <div
                key={entry.fid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: entry.fid === fid ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  marginLeft: -20,
                  marginRight: -20,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: 36,
                    fontSize: entry.rank <= 3 ? 18 : 14,
                    fontWeight: 'bold',
                    color: entry.rank <= 3 ? '#fbbf24' : '#fff',
                  }}
                >
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>

                {/* User info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: entry.fid === fid ? 'bold' : 'normal',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {entry.displayName || (entry.username ? `@${entry.username}` : `FID:${entry.fid}`)}
                    {entry.fid === fid && <span style={{ marginLeft: 8, color: '#8b5cf6' }}>(you)</span>}
                  </div>
                  {entry.username && entry.displayName && (
                    <div style={{ fontSize: 11, opacity: 0.6 }}>@{entry.username}</div>
                  )}
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{entry.score}</div>
                  {entry.prize && (
                    <div style={{ fontSize: 10, color: '#fbbf24' }}>
                      {formatPrize(entry.prize)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          fontSize: 11,
          opacity: 0.5,
        }}
      >
        {viewType === 'daily'
          ? 'Prizes paid daily at 00:05 UTC on Base L2'
          : 'All-time high scores (no prizes)'}
      </div>
    </div>
  )
}
