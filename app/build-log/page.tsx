'use client'

interface BuildEntry {
  date: string
  title: string
  description: string
}

const BUILD_LOG: BuildEntry[] = [
  {
    date: '2026-01-11',
    title: 'Game Speed Curve Adjustment',
    description:
      'Adjusted the game speed progression to reach 6x max speed over 60 seconds instead of the previous 3x over 16 seconds. This creates a more gradual difficulty curve that rewards longer play sessions.',
  },
  {
    date: '2026-01-11',
    title: 'All-Time Leaderboard',
    description:
      'Added an all-time high score leaderboard with a toggle between Daily and All Time views. Players can now see their all-time best score on the lobby screen. No prizes for all-time scores - purely for bragging rights.',
  },
  {
    date: '2026-01-11',
    title: 'Lobby UI Improvements',
    description:
      'Moved the Play button directly below the player card and made it larger with a glowing effect. Added a live countdown timer showing time until the next payout at 00:05 UTC.',
  },
  {
    date: '2026-01-11',
    title: 'Farcaster Discovery Cleanup',
    description:
      'Removed redundant miniapp.json file since farcaster.json is the only required manifest per the official Farcaster Mini Apps specification. The app is now properly configured for protocol discovery.',
  },
]

export default function BuildLogPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'monospace',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Build Log</h1>
        <p
          style={{
            fontSize: 14,
            opacity: 0.7,
            lineHeight: 1.6,
            marginBottom: 32,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: 20,
          }}
        >
          I&apos;m vibe coding this app - building features as inspiration strikes and
          iterating based on what feels right. This log keeps track of what&apos;s
          progressing and serves as a changelog for anyone curious about the
          journey.
        </p>

        {/* Build entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {BUILD_LOG.map((entry, index) => (
            <div
              key={index}
              style={{
                padding: 16,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                borderLeft: '3px solid #8b5cf6',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.5,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {entry.date}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: '#8b5cf6' }}>
                {entry.title}
              </h3>
              <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
                {entry.description}
              </p>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#8b5cf6',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            &larr; Back to Game
          </a>
        </div>
      </div>
    </div>
  )
}
