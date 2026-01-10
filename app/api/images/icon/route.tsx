import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          backgroundColor: '#1a1a2e',
          borderRadius: 64,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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

        {/* Player character */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 40,
          }}
        >
          {/* Body */}
          <div
            style={{
              width: 100,
              height: 133,
              backgroundColor: '#3498db',
              borderRadius: 4,
              position: 'relative',
              display: 'flex',
            }}
          >
            {/* Eye */}
            <div
              style={{
                position: 'absolute',
                top: 27,
                right: 8,
                width: 20,
                height: 20,
                backgroundColor: '#2980b9',
                borderRadius: 2,
              }}
            />
            {/* Mouth */}
            <div
              style={{
                position: 'absolute',
                top: 67,
                right: 8,
                width: 20,
                height: 13,
                backgroundColor: '#2980b9',
                borderRadius: 2,
              }}
            />
          </div>
          {/* Legs */}
          <div style={{ display: 'flex', gap: 13 }}>
            <div
              style={{
                width: 27,
                height: 27,
                backgroundColor: '#2980b9',
              }}
            />
            <div
              style={{
                width: 27,
                height: 27,
                backgroundColor: '#2980b9',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
