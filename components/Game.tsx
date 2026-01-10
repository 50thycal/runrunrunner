'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'

type GameState = 'idle' | 'starting' | 'playing' | 'gameover' | 'submitting'
type Lane = 'floor' | 'ceiling'

interface Obstacle {
  x: number
  lane: Lane
  width: number
  height: number
}

const PLAYER_WIDTH = 30
const PLAYER_HEIGHT = 40
const PLAYER_X = 60
const OBSTACLE_WIDTH = 30
const OBSTACLE_HEIGHT = 50
const FLIP_DURATION = 150 // ms
const MIN_OBSTACLE_GAP = 250 // minimum pixels between obstacles
const BASE_SPEED = 4
const MAX_SPEED = 12
const SPEED_INCREASE_RATE = 0.0005
const BASE_SPAWN_INTERVAL = 1500 // ms
const MIN_SPAWN_INTERVAL = 600 // ms

interface GameProps {
  username?: string
  displayName?: string
  fid: number
  authToken: string // Required auth token for authenticated API requests
  onShowLeaderboard?: () => void
  onBackToLobby?: () => void
}

export function Game({ username, displayName, fid, authToken, onShowLeaderboard, onBackToLobby }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [serverRank, setServerRank] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Game state refs for animation loop
  const gameStateRef = useRef<GameState>('idle')
  const playerLaneRef = useRef<Lane>('floor')
  const playerYRef = useRef(0)
  const targetYRef = useRef(0)
  const flipStartTimeRef = useRef(0)
  const isFlippingRef = useRef(false)
  const obstaclesRef = useRef<Obstacle[]>([])
  const scoreRef = useRef(0)
  const speedRef = useRef(BASE_SPEED)
  const lastSpawnTimeRef = useRef(0)
  const gameStartTimeRef = useRef(0)
  const animationFrameRef = useRef<number>(0)
  const canvasSizeRef = useRef({ width: 0, height: 0 })
  const floorYRef = useRef(0)
  const ceilingYRef = useRef(0)
  const sessionTokenRef = useRef<string | null>(null)

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

  // Get lane Y positions based on canvas size
  const getLaneY = useCallback((lane: Lane) => {
    const { height } = canvasSizeRef.current
    const padding = 60
    if (lane === 'floor') {
      return height - padding - PLAYER_HEIGHT
    } else {
      return padding
    }
  }, [])

  // Handle canvas resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    canvasSizeRef.current = { width: rect.width, height: rect.height }
    floorYRef.current = getLaneY('floor')
    ceilingYRef.current = getLaneY('ceiling')

    // Update player position if not flipping
    if (!isFlippingRef.current) {
      playerYRef.current = getLaneY(playerLaneRef.current)
      targetYRef.current = playerYRef.current
    }
  }, [getLaneY])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Flip player to opposite lane
  const flip = useCallback(() => {
    if (gameStateRef.current !== 'playing' || isFlippingRef.current) return

    const newLane = playerLaneRef.current === 'floor' ? 'ceiling' : 'floor'
    playerLaneRef.current = newLane
    targetYRef.current = getLaneY(newLane)
    isFlippingRef.current = true
    flipStartTimeRef.current = performance.now()
  }, [getLaneY])

  // Request session token from server
  const requestSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fid }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to get session:', data.error)
        // Show user-friendly error messages
        if (data.error === 'KV_NOT_CONFIGURED') {
          setSubmitError('Server not configured. Please try again later.')
        } else if (response.status === 429) {
          setSubmitError(data.error || 'Too many games. Wait a bit.')
        } else {
          setSubmitError(data.error || 'Failed to start game')
        }
        return null
      }

      return data.sessionToken
    } catch (error) {
      console.error('Session request error:', error)
      setSubmitError('Network error - check your connection')
      return null
    }
  }, [fid, authToken])

  // Submit score to server
  const submitScore = useCallback(async (finalScore: number, token: string) => {
    try {
      const response = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: token,
          score: finalScore,
          fid,
          username,
          displayName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Score submission failed:', data.error)
        setSubmitError(data.error || 'Failed to submit score')
        return
      }

      setServerRank(data.rank)
      setSubmitError(null)
    } catch (error) {
      console.error('Score submission error:', error)
      setSubmitError('Network error')
    }
  }, [fid, username, displayName])

  // Start the game (with session)
  const startGame = useCallback(async () => {
    // Reset state
    setSubmitError(null)
    setServerRank(null)
    setGameState('starting')
    gameStateRef.current = 'starting'

    // Request session token
    const token = await requestSession()
    if (!token) {
      setGameState('idle')
      gameStateRef.current = 'idle'
      return
    }

    sessionTokenRef.current = token

    // Start game
    gameStateRef.current = 'playing'
    setGameState('playing')
    playerLaneRef.current = 'floor'
    playerYRef.current = getLaneY('floor')
    targetYRef.current = playerYRef.current
    isFlippingRef.current = false
    obstaclesRef.current = []
    scoreRef.current = 0
    setScore(0)
    speedRef.current = BASE_SPEED
    gameStartTimeRef.current = performance.now()
    lastSpawnTimeRef.current = performance.now()
  }, [getLaneY, requestSession])

  // End the game
  const endGame = useCallback(async () => {
    gameStateRef.current = 'submitting'
    setGameState('submitting')

    const finalScore = scoreRef.current
    setScore(finalScore)

    // Update local best score
    const currentBest = parseInt(localStorage.getItem('runrunrunner-best') || '0', 10)
    if (finalScore > currentBest) {
      localStorage.setItem('runrunrunner-best', finalScore.toString())
      setBestScore(finalScore)
    }

    // Submit score to server
    if (sessionTokenRef.current) {
      await submitScore(finalScore, sessionTokenRef.current)
    }

    setGameState('gameover')
    gameStateRef.current = 'gameover'
  }, [submitScore])

  // Handle input
  const handleInput = useCallback(() => {
    if (gameStateRef.current === 'idle') {
      startGame()
    } else if (gameStateRef.current === 'playing') {
      flip()
    } else if (gameStateRef.current === 'gameover') {
      startGame()
    }
    // Ignore input during 'starting' and 'submitting' states
  }, [startGame, flip])

  // Share handler - opens Farcaster composer with frame
  const handleShare = useCallback(async () => {
    const currentScore = scoreRef.current
    const rankText = serverRank ? ` Rank #${serverRank} today!` : ''

    // Build frame URL with score data
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const frameParams = new URLSearchParams({
      score: currentScore.toString(),
      username: username || 'Anonymous',
    })
    if (serverRank) frameParams.set('rank', serverRank.toString())
    const frameUrl = `${baseUrl}/api/frame?${frameParams.toString()}`

    // Compose text for the cast
    const text = `I scored ${currentScore} in runrunrunner! 🏃${rankText}\n\nCan you beat my score?`

    try {
      // Use Farcaster SDK to open composer with frame embed
      await sdk.actions.composeCast({
        text,
        embeds: [frameUrl],
      })
      setShareMessage('Opening composer...')
      setTimeout(() => setShareMessage(null), 2000)
    } catch (error) {
      console.error('Share error:', error)
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${text}\n\n${frameUrl}`)
        setShareMessage('Copied to clipboard!')
        setTimeout(() => setShareMessage(null), 2000)
      } catch {
        setShareMessage('Could not share')
        setTimeout(() => setShareMessage(null), 2000)
      }
    }
  }, [username, serverRank])

  // Input event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleInput()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleInput])

  // Check if can spawn obstacle (prevent impossible sequences)
  const canSpawnObstacle = useCallback((lane: Lane) => {
    const obstacles = obstaclesRef.current
    const { width } = canvasSizeRef.current

    // Check if there's an obstacle too close in the same lane
    for (const obs of obstacles) {
      if (obs.lane === lane && obs.x > width - MIN_OBSTACLE_GAP) {
        return false
      }
    }

    // Check if spawning would create impossible pattern
    const recentObstacles = obstacles.filter(o => o.x > width - MIN_OBSTACLE_GAP * 1.5)
    if (recentObstacles.length >= 1) {
      const otherLane = lane === 'floor' ? 'ceiling' : 'floor'
      const hasBlockingObstacle = recentObstacles.some(o => o.lane === otherLane && o.x > width - MIN_OBSTACLE_GAP * 0.8)
      if (hasBlockingObstacle) {
        return false
      }
    }

    return true
  }, [])

  // Spawn obstacle
  const spawnObstacle = useCallback(() => {
    const { width } = canvasSizeRef.current
    const lane: Lane = Math.random() < 0.5 ? 'floor' : 'ceiling'

    if (!canSpawnObstacle(lane)) {
      const otherLane = lane === 'floor' ? 'ceiling' : 'floor'
      if (canSpawnObstacle(otherLane)) {
        obstaclesRef.current.push({
          x: width + OBSTACLE_WIDTH,
          lane: otherLane,
          width: OBSTACLE_WIDTH,
          height: OBSTACLE_HEIGHT,
        })
      }
      return
    }

    obstaclesRef.current.push({
      x: width + OBSTACLE_WIDTH,
      lane,
      width: OBSTACLE_WIDTH,
      height: OBSTACLE_HEIGHT,
    })
  }, [canSpawnObstacle])

  // Check collision
  const checkCollision = useCallback(() => {
    const playerY = playerYRef.current
    const playerLane = playerLaneRef.current

    for (const obs of obstaclesRef.current) {
      if (obs.lane !== playerLane) continue

      const playerRight = PLAYER_X + PLAYER_WIDTH
      const obsRight = obs.x + obs.width

      if (playerRight > obs.x && PLAYER_X < obsRight) {
        const obsY = obs.lane === 'floor'
          ? floorYRef.current + (PLAYER_HEIGHT - obs.height)
          : ceilingYRef.current

        const playerBottom = playerY + PLAYER_HEIGHT
        const obsBottom = obsY + obs.height

        if (playerBottom > obsY && playerY < obsBottom) {
          return true
        }
      }
    }

    return false
  }, [])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = (currentTime: number) => {
      const { width, height } = canvasSizeRef.current

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)

      // Draw lanes
      const laneHeight = 4
      ctx.fillStyle = '#4a4a6a'
      ctx.fillRect(0, floorYRef.current + PLAYER_HEIGHT, width, laneHeight)
      ctx.fillRect(0, ceilingYRef.current - laneHeight, width, laneHeight)

      if (gameStateRef.current === 'playing') {
        // Update game time and score
        const elapsed = currentTime - gameStartTimeRef.current
        scoreRef.current = Math.floor(elapsed / 100)
        setScore(scoreRef.current)

        // Update speed
        speedRef.current = Math.min(MAX_SPEED, BASE_SPEED + elapsed * SPEED_INCREASE_RATE)

        // Spawn obstacles
        const spawnInterval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - elapsed * 0.1)
        if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
          spawnObstacle()
          lastSpawnTimeRef.current = currentTime
        }

        // Update obstacles
        obstaclesRef.current = obstaclesRef.current.filter(obs => {
          obs.x -= speedRef.current
          return obs.x > -obs.width
        })

        // Update player flip animation
        if (isFlippingRef.current) {
          const flipProgress = Math.min(1, (currentTime - flipStartTimeRef.current) / FLIP_DURATION)
          const startY = playerLaneRef.current === 'ceiling' ? floorYRef.current : ceilingYRef.current
          const eased = 1 - Math.pow(1 - flipProgress, 3)
          playerYRef.current = startY + (targetYRef.current - startY) * eased

          if (flipProgress >= 1) {
            isFlippingRef.current = false
            playerYRef.current = targetYRef.current
          }
        }

        // Check collision
        if (checkCollision()) {
          endGame()
        }
      }

      // Draw obstacles
      ctx.fillStyle = '#e74c3c'
      for (const obs of obstaclesRef.current) {
        const obsY = obs.lane === 'floor'
          ? floorYRef.current + (PLAYER_HEIGHT - obs.height)
          : ceilingYRef.current

        ctx.fillRect(obs.x, obsY, obs.width, obs.height)

        ctx.beginPath()
        ctx.moveTo(obs.x, obsY)
        ctx.lineTo(obs.x + obs.width / 2, obsY - 10)
        ctx.lineTo(obs.x + obs.width, obsY)
        ctx.fill()
      }

      // Draw player with rotation based on lane
      const playerY = playerYRef.current
      const playerCenterX = PLAYER_X + PLAYER_WIDTH / 2
      const playerCenterY = playerY + PLAYER_HEIGHT / 2

      // Calculate rotation: 0° on floor, 180° on ceiling, animated during flip
      let rotation = 0
      if (isFlippingRef.current) {
        const flipProgress = Math.min(1, (currentTime - flipStartTimeRef.current) / FLIP_DURATION)
        const eased = 1 - Math.pow(1 - flipProgress, 3)
        // Rotate from current to target
        if (playerLaneRef.current === 'ceiling') {
          rotation = eased * Math.PI // 0 to 180°
        } else {
          rotation = Math.PI - (eased * Math.PI) // 180° to 0
        }
      } else {
        rotation = playerLaneRef.current === 'ceiling' ? Math.PI : 0
      }

      ctx.save()
      ctx.translate(playerCenterX, playerCenterY)
      ctx.rotate(rotation)
      ctx.translate(-playerCenterX, -playerCenterY)

      // Body
      ctx.fillStyle = '#3498db'
      ctx.fillRect(PLAYER_X, playerY, PLAYER_WIDTH, PLAYER_HEIGHT)

      // Eye and mouth
      ctx.fillStyle = '#2980b9'
      ctx.fillRect(PLAYER_X + PLAYER_WIDTH - 8, playerY + 8, 6, 6)
      ctx.fillRect(PLAYER_X + PLAYER_WIDTH - 8, playerY + 20, 6, 4)

      // Legs with running animation
      const legOffset = gameStateRef.current === 'playing' ? Math.sin(currentTime / 50) * 4 : 0
      ctx.fillStyle = '#2980b9'
      ctx.fillRect(PLAYER_X + 5, playerY + PLAYER_HEIGHT, 8, 8 + legOffset)
      ctx.fillRect(PLAYER_X + PLAYER_WIDTH - 13, playerY + PLAYER_HEIGHT, 8, 8 - legOffset)

      ctx.restore()

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [spawnObstacle, checkCollision, endGame])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a2e',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onClick={handleInput}
      onTouchStart={(e) => {
        e.preventDefault()
        handleInput()
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Score display */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 20,
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 28 }}>{score}</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>BEST: {bestScore}</div>
      </div>

      {/* Idle overlay */}
      {gameState === 'idle' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>runrunrunner</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.7 }}>v-012</p>
          {(username || displayName) && (
            <p style={{ marginTop: 16, fontSize: 14, color: '#8b5cf6' }}>
              Playing as {displayName || `@${username}`}
            </p>
          )}
          <p style={{ marginTop: 40, fontSize: 18, animation: 'pulse 1.5s infinite' }}>
            Tap to start
          </p>
          <p style={{ marginTop: 20, fontSize: 12, opacity: 0.5 }}>
            Tap or press SPACE to flip lanes
          </p>
          {submitError && (
            <div style={{
              marginTop: 20,
              padding: '12px 20px',
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              borderRadius: 8,
              border: '1px solid #e74c3c',
            }}>
              <p style={{ margin: 0, fontSize: 14, color: '#e74c3c' }}>
                {submitError}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Starting overlay */}
      {gameState === 'starting' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          <p style={{ fontSize: 18 }}>Starting...</p>
        </div>
      )}

      {/* Submitting overlay */}
      {gameState === 'submitting' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          <p style={{ fontSize: 18 }}>Submitting score...</p>
        </div>
      )}

      {/* Game over overlay */}
      {gameState === 'gameover' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32, color: '#e74c3c' }}>Game Over</h1>
          <p style={{ margin: '20px 0 0', fontSize: 24 }}>Score: {score}</p>

          {serverRank !== null && (
            <p style={{
              margin: '12px 0 0',
              fontSize: 18,
              color: serverRank <= 3 ? '#fbbf24' : '#fff',
              fontWeight: serverRank <= 3 ? 'bold' : 'normal',
            }}>
              {serverRank <= 3 ? `🏆 Rank #${serverRank} - Prize Eligible!` : `Rank #${serverRank}`}
            </p>
          )}

          {submitError && (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: '#e74c3c' }}>
              {submitError}
            </p>
          )}

          <p style={{ margin: '8px 0 0', fontSize: 16, opacity: 0.7 }}>Best: {bestScore}</p>
          <p style={{ marginTop: 30, fontSize: 18, animation: 'pulse 1.5s infinite' }}>
            Tap to play again
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              onTouchStart={(e) => e.stopPropagation()}
              style={{
                padding: '10px 24px',
                fontSize: 14,
                fontFamily: 'monospace',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Share
            </button>

            {onShowLeaderboard && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShowLeaderboard()
                }}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  backgroundColor: '#8b5cf6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Leaderboard
              </button>
            )}

            {onBackToLobby && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onBackToLobby()
                }}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Lobby
              </button>
            )}
          </div>

          {shareMessage && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#2ecc71' }}>
              {shareMessage}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
