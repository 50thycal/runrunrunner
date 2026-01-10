import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          backgroundColor: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Ceiling lane */}
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: '#4a4a6a',
          }}
        />

        {/* Floor lane */}
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: '#4a4a6a',
          }}
        />

        {/* Player character on floor */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            bottom: 124,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Body */}
          <div
            style={{
              width: 75,
              height: 100,
              backgroundColor: '#3498db',
              borderRadius: 3,
              position: 'relative',
              display: 'flex',
            }}
          >
            {/* Eye */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 6,
                width: 15,
                height: 15,
                backgroundColor: '#2980b9',
                borderRadius: 2,
              }}
            />
            {/* Mouth */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                right: 6,
                width: 15,
                height: 10,
                backgroundColor: '#2980b9',
                borderRadius: 2,
              }}
            />
          </div>
          {/* Legs */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: '#2980b9',
                marginLeft: 12,
              }}
            />
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: '#2980b9',
              }}
            />
          </div>
        </div>

        {/* Red obstacle on floor */}
        <div
          style={{
            position: 'absolute',
            left: 500,
            bottom: 104,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Spike */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '37px solid transparent',
              borderRight: '37px solid transparent',
              borderBottom: '25px solid #e74c3c',
            }}
          />
          {/* Body */}
          <div
            style={{
              width: 75,
              height: 125,
              backgroundColor: '#e74c3c',
            }}
          />
        </div>

        {/* Red obstacle on ceiling */}
        <div
          style={{
            position: 'absolute',
            left: 800,
            top: 104,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Body */}
          <div
            style={{
              width: 75,
              height: 125,
              backgroundColor: '#e74c3c',
            }}
          />
          {/* Spike */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '37px solid transparent',
              borderRight: '37px solid transparent',
              borderTop: '25px solid #e74c3c',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#ffffff',
              fontFamily: 'monospace',
            }}
          >
            runrunrunner
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#8b5cf6',
              fontFamily: 'monospace',
              marginTop: 8,
            }}
          >
            Flip to survive. Win ETH daily.
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
