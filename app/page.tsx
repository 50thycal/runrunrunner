'use client'

import { useEffect, useState } from 'react'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Game } from '@/components/Game'
import { Lobby } from '@/components/Lobby'

export default function Home() {
  const { status, user, error, signIn, signOut, isInMiniApp } = useAuthSession()
  const [showGame, setShowGame] = useState(false)
  const [bestScore, setBestScore] = useState(0)

  // Load best score from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('runrunrunner-best')
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) {
        setBestScore(parsed)
      }
    }
  }, [])

  // Loading state
  if (status === 'loading') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'monospace',
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Not signed in - show sign-in screen
  if (status === 'signedOut' || !user) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'monospace',
        padding: 20,
        textAlign: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>runrunrunner</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.7 }}>v-012</p>

        <p style={{ marginTop: 40, fontSize: 14, opacity: 0.8, maxWidth: 280 }}>
          An endless platform runner. Flip between floor and ceiling to survive!
        </p>

        {!isInMiniApp && (
          <div style={{
            marginTop: 30,
            padding: '16px 20px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            maxWidth: 300,
          }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              Open this app in Farcaster to sign in and play.
            </p>
          </div>
        )}

        {isInMiniApp && (
          <>
            {error && (
              <div style={{
                marginTop: 20,
                padding: '12px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 8,
                color: '#fca5a5',
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={signIn}
              style={{
                marginTop: 40,
                padding: '14px 32px',
                fontSize: 16,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                backgroundColor: '#8b5cf6',
                color: '#fff',
                border: 'none',
                borderRadius: 30,
                cursor: 'pointer',
              }}
            >
              Sign in with Farcaster
            </button>
          </>
        )}
      </div>
    )
  }

  // Signed in but not playing yet - show lobby
  if (!showGame) {
    return (
      <Lobby
        username={user.username}
        displayName={user.displayName}
        pfpUrl={user.pfpUrl}
        verified={user.verified}
        bestScore={bestScore}
        onPlay={() => setShowGame(true)}
        onSignOut={() => {
          setShowGame(false)
          signOut()
        }}
      />
    )
  }

  // Playing - show game
  return (
    <Game
      username={user.username}
      displayName={user.displayName}
      fid={user.fid}
    />
  )
}
