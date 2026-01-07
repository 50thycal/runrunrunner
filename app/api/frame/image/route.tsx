import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const score = searchParams.get('score') || '0'
  const username = searchParams.get('username') || 'Anonymous'
  const rank = searchParams.get('rank')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          fontFamily: 'monospace',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(74, 74, 106, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 74, 106, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            zIndex: 1,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: 8,
            }}
          >
            runrunrunner
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 40,
            }}
          >
            v-012
          </div>

          {/* Score card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              borderRadius: 24,
              padding: '32px 64px',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 8,
              }}
            >
              @{username} scored
            </div>
            <div
              style={{
                fontSize: 96,
                fontWeight: 'bold',
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            {rank && (
              <div
                style={{
                  fontSize: 24,
                  color: parseInt(rank) <= 3 ? '#fbbf24' : 'rgba(255,255,255,0.7)',
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {parseInt(rank) <= 3 ? '🏆 ' : ''}Rank #{rank} today
              </div>
            )}
          </div>

          {/* Call to action */}
          <div
            style={{
              fontSize: 28,
              color: '#3498db',
              fontWeight: 'bold',
            }}
          >
            Can you beat this score?
          </div>
        </div>

        {/* Player character */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            width: 40,
            height: 50,
            backgroundColor: '#3498db',
            borderRadius: 4,
          }}
        />

        {/* Obstacle */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 120,
            width: 35,
            height: 55,
            backgroundColor: '#e74c3c',
            borderRadius: 4,
          }}
        />

        {/* Floor line */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: '#4a4a6a',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
