import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 200,
          height: 200,
          backgroundColor: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Player character */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Body */}
          <div
            style={{
              width: 60,
              height: 80,
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
                top: 16,
                right: 5,
                width: 12,
                height: 12,
                backgroundColor: '#2980b9',
                borderRadius: 2,
              }}
            />
            {/* Mouth */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 5,
                width: 12,
                height: 8,
                backgroundColor: '#2980b9',
                borderRadius: 1,
              }}
            />
          </div>
          {/* Legs */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: '#2980b9',
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: '#2980b9',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  )
}
