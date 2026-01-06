'use client'

interface LobbyProps {
  username?: string
  displayName?: string
  pfpUrl?: string
  verified: boolean
  bestScore: number
  onPlay: () => void
  onSignOut: () => void
}

export function Lobby({
  username,
  displayName,
  pfpUrl,
  verified,
  bestScore,
  onPlay,
  onSignOut,
}: LobbyProps) {
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
        <p style={{ margin: '8px 0 0', opacity: 0.7 }}>v-012</p>
      </div>

      {/* User info */}
      <div
        style={{
          marginTop: 30,
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

      {/* Best score */}
      {bestScore > 0 && (
        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>BEST SCORE</div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fbbf24' }}>
            {bestScore}
          </div>
        </div>
      )}

      {/* How to play */}
      <div
        style={{
          marginTop: 30,
          padding: 20,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          maxWidth: 320,
          width: '100%',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 18, textAlign: 'center' }}>
          How to Play
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#3498db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div style={{ fontSize: 14 }}>
              You auto-run on two lanes: <strong>floor</strong> and <strong>ceiling</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#3498db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Tap</strong> or press <strong>SPACE</strong> to flip between lanes
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#e74c3c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div style={{ fontSize: 14 }}>
              Avoid the <span style={{ color: '#e74c3c' }}>red obstacles</span> — one hit and it's game over!
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              4
            </div>
            <div style={{ fontSize: 14 }}>
              Survive as long as you can. Speed increases over time!
            </div>
          </div>
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={onPlay}
        style={{
          marginTop: 30,
          padding: '16px 48px',
          fontSize: 20,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          backgroundColor: '#8b5cf6',
          color: '#fff',
          border: 'none',
          borderRadius: 30,
          cursor: 'pointer',
          transition: 'transform 0.1s',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        PLAY
      </button>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        style={{
          marginTop: 20,
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
