'use client'

import { useEffect } from 'react'
import sdk from '@farcaster/miniapp-sdk'
import { Game } from '@/components/Game'

export default function Home() {
  // Signal to Farcaster that app is ready
  useEffect(() => {
    sdk.actions.ready()
  }, [])

  return <Game />
}
