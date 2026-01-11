# runrunrunner

An endless runner game built on Farcaster Mini Apps, with daily ETH prizes on Base L2.

## About This Project

This app is being **vibe coded** - built iteratively based on inspiration and what feels right in the moment. Features are added organically, and the codebase evolves through experimentation rather than rigid planning.

The goal is to create a fun, competitive mini game where players can compete for daily prizes while tracking their all-time high scores.

## How to Play

- **Tap** anywhere or press **SPACE** to flip between floor and ceiling lanes
- Avoid the red obstacles
- Survive as long as possible to get a high score
- Top 3 daily scores win ETH prizes on Base L2
- Payouts happen daily at 00:05 UTC

## Build Log

This project maintains a **Build Log** at `/build-log` that tracks all development progress. Each time changes are made to the codebase, a new entry should be added to the log with:
- Date of the change
- Short title describing the update
- 3-sentence max description of what changed and why

The Build Log serves as both a changelog and a record of the vibe coding journey.

### For AI Assistants

**Important**: When making changes to this codebase, you should update the Build Log located at `app/build-log/page.tsx`. Add a new entry to the `BUILD_LOG` array at the top of the file with:

```typescript
{
  date: 'YYYY-MM-DD',
  title: 'Short Title of Change',
  description: 'Brief description (3 sentences max) explaining what was changed and why.',
}
```

Add new entries at the top of the array so the most recent changes appear first.

## Features

- **Daily Contests**: Top 3 scores each day win ETH prizes
- **All-Time Leaderboard**: Track your best scores ever (no prizes, just bragging rights)
- **Payout Countdown**: Live timer showing when the next payout happens
- **Farcaster Integration**: Sign in with your Farcaster account via QuickAuth
- **Progressive Difficulty**: Game speeds up to 6x over 60 seconds

## Tech Stack

- **Next.js 16** (App Router)
- **Farcaster Mini App SDK**
- **Neynar API** for Farcaster integration
- **Vercel KV** for leaderboards and game state
- **Base L2** for prize payouts

## Local Development

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to play locally.

## Environment Variables

```env
NEYNAR_API_KEY=your_neynar_api_key
APP_BACKEND_URL=https://your-domain.vercel.app
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
PAYOUT_WALLET_PRIVATE_KEY=your_payout_wallet_key
CRON_SECRET=your_cron_secret
```

## Project Structure

```
runrunrunner/
├── app/
│   ├── page.tsx           # Main game entry
│   ├── build-log/         # Build log page
│   ├── config.ts          # App configuration
│   └── api/               # API routes
├── components/
│   ├── Game.tsx           # Game canvas and logic
│   ├── Lobby.tsx          # Pre-game lobby UI
│   └── Leaderboard.tsx    # Daily/All-time leaderboards
├── lib/
│   └── contest.ts         # Contest and payout logic
├── hooks/
│   └── useAuthSession.ts  # Farcaster auth hook
└── public/
    └── .well-known/
        └── farcaster.json # Farcaster manifest
```

## Links

- **Play**: [runrunrunner.vercel.app](https://runrunrunner.vercel.app)
- **Build Log**: [runrunrunner.vercel.app/build-log](https://runrunrunner.vercel.app/build-log)

## License

MIT
