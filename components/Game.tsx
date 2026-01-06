'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type GameState = 'idle' | 'playing' | 'gameover'
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
}

export function Game({ username, displayName, fid }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

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

  // Start the game
  const startGame = useCallback(() => {
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
  }, [getLaneY])

  // End the game
  const endGame = useCallback(() => {
    gameStateRef.current = 'gameover'
    setGameState('gameover')

    const finalScore = scoreRef.current
    setScore(finalScore)

    // Update best score
    const currentBest = parseInt(localStorage.getItem('runrunrunner-best') || '0', 10)
    if (finalScore > currentBest) {
      localStorage.setItem('runrunrunner-best', finalScore.toString())
      setBestScore(finalScore)
    }
  }, [])

  // Handle input
  const handleInput = useCallback(() => {
    if (gameStateRef.current === 'idle') {
      startGame()
    } else if (gameStateRef.current === 'playing') {
      flip()
    } else if (gameStateRef.current === 'gameover') {
      startGame()
    }
  }, [startGame, flip])

  // Share handler
  const handleShare = useCallback(async () => {
    const playerName = username ? `@${username}` : `FID:${fid}`
    const text = `${playerName} scored ${scoreRef.current} in runrunrunner v-012! 🏃`
    try {
      await navigator.clipboard.writeText(text)
      setShareMessage('Copied to clipboard!')
      setTimeout(() => setShareMessage(null), 2000)
    } catch {
      setShareMessage('Could not copy')
      setTimeout(() => setShareMessage(null), 2000)
    }
  }, [username, fid])

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
    // (obstacles in both lanes too close together)
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

    // Randomly pick a lane
    const lane: Lane = Math.random() < 0.5 ? 'floor' : 'ceiling'

    if (!canSpawnObstacle(lane)) {
      // Try other lane
      const otherLane = lane === 'floor' ? 'ceiling' : 'floor'
      if (canSpawnObstacle(otherLane)) {
        obstaclesRef.current.push({
          x: width + OBSTACLE_WIDTH,
          lane: otherLane,
          width: OBSTACLE_WIDTH,
          height: OBSTACLE_HEIGHT,
        })
      }
      // If neither works, skip this spawn
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
      // Only check obstacles in same lane
      if (obs.lane !== playerLane) continue

      // Check X overlap
      const playerRight = PLAYER_X + PLAYER_WIDTH
      const obsRight = obs.x + obs.width

      if (playerRight > obs.x && PLAYER_X < obsRight) {
        // Check Y overlap
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

        // Update speed (gradual increase)
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

          // Smooth easing
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

        // Spiky top
        ctx.beginPath()
        ctx.moveTo(obs.x, obsY)
        ctx.lineTo(obs.x + obs.width / 2, obsY - 10)
        ctx.lineTo(obs.x + obs.width, obsY)
        ctx.fill()
      }

      // Draw player
      const playerY = playerYRef.current
      ctx.fillStyle = '#3498db'
      ctx.fillRect(PLAYER_X, playerY, PLAYER_WIDTH, PLAYER_HEIGHT)

      // Player details (simple face direction)
      ctx.fillStyle = '#2980b9'
      ctx.fillRect(PLAYER_X + PLAYER_WIDTH - 8, playerY + 8, 6, 6)
      ctx.fillRect(PLAYER_X + PLAYER_WIDTH - 8, playerY + 20, 6, 4)

      // Legs animation
      const legOffset = gameStateRef.current === 'playing' ? Math.sin(currentTime / 50) * 4 : 0
      ctx.fillStyle = '#2980b9'
      ctx.fillRect(PLAYER_X + 5, playerY + PLAYER_HEIGHT, 8, 8 + legOffset)
      ctx.fillRect(PLAYER_X + PLAYER_WIDTH - 13, playerY + PLAYER_HEIGHT, 8, 8 - legOffset)

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
          <p style={{ margin: '8px 0 0', fontSize: 16, opacity: 0.7 }}>Best: {bestScore}</p>
          <p style={{ marginTop: 40, fontSize: 18, animation: 'pulse 1.5s infinite' }}>
            Tap to restart
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            style={{
              marginTop: 30,
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
