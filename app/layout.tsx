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
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
    images: [`${BASE_URL}/embed-preview.png`],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
    images: [`${BASE_URL}/embed-preview.png`],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: `${BASE_URL}/embed-preview.png`,
      splashImageUrl: `${BASE_URL}/splash.png`,
      splashBackgroundColor: '#1a1a2e',
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
