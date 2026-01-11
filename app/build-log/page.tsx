'use client'

interface BuildEntry {
  timestamp: string
  title: string
  description: string
}

const BUILD_LOG: BuildEntry[] = [
  {
    timestamp: '2026-01-11 19:00',
    title: 'Build Log Page Fixes',
    description:
      'Fixed scrolling on the build log page. Added timestamps to entries because dates alone felt too vague. Rewrote the description to be less corporate and more honest about the development process.',
  },
  {
    timestamp: '2026-01-11 18:45',
    title: 'Header Navigation Bar',
    description:
      'Added a top navigation bar to the Lobby with the game title and a prominent "Build Log" button. This makes the development changelog easily discoverable for users.',
  },
  {
    timestamp: '2026-01-11 18:30',
    title: 'README and Build Log Documentation',
    description:
      'Updated README to explain this is a vibe-coded Farcaster game with daily ETH prizes. Added instructions for AI assistants to update the build log when making changes. The build log now serves as a living changelog.',
  },
  {
    timestamp: '2026-01-11 18:15',
    title: 'Build Log Page',
    description:
      'Created a dedicated build log page at /build-log to track development progress. Each entry includes a date, title, and brief description of changes. This documents the vibe coding journey.',
  },
  {
    timestamp: '2026-01-11 18:00',
    title: 'Game Speed Curve Adjustment',
    description:
      'Adjusted the game speed progression to reach 6x max speed over 60 seconds instead of the previous 3x over 16 seconds. This creates a more gradual difficulty curve that rewards longer play sessions.',
  },
  {
    timestamp: '2026-01-11 17:30',
    title: 'All-Time Leaderboard',
    description:
      'Added an all-time high score leaderboard with a toggle between Daily and All Time views. Players can now see their all-time best score on the lobby screen. No prizes for all-time scores, purely for bragging rights.',
  },
  {
    timestamp: '2026-01-11 17:00',
    title: 'Lobby UI Improvements',
    description:
      'Moved the Play button directly below the player card and made it larger with a glowing effect. Added a live countdown timer showing time until the next payout at 00:05 UTC.',
  },
  {
    timestamp: '2026-01-11 16:30',
    title: 'Farcaster Discovery Cleanup',
    description:
      'Removed redundant miniapp.json file since farcaster.json is the only required manifest per the official Farcaster Mini Apps specification. The app is now properly configured for protocol discovery.',
  },
]

export default function BuildLogPage() {
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
        overflow: 'auto',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
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
          This app is being built through vibes and mild caffeine dependency.
          Features appear when they feel right. Bugs disappear when they feel
          like it. This log exists so I remember what I did and why.
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
                {entry.timestamp}
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
        <div style={{ marginTop: 32, paddingBottom: 40, textAlign: 'center' }}>
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
