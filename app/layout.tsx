import type { Metadata, Viewport } from 'next'
import { APP_CONFIG } from './config'

const BASE_URL = `https://${APP_CONFIG.domain}` // Update domain in config.ts

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: `${BASE_URL}/embed-preview.png`,
      button: {
        title: APP_CONFIG.miniAppButtonTitle,
        action: {
          type: 'launch_miniapp',
          name: APP_CONFIG.title,
          url: `${BASE_URL}/`,
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
        }}
      >
        {children}
      </body>
    </html>
  )
}
