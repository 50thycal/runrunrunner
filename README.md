# runrunrunner v-012

An endless platform runner game for Farcaster Mini Apps.

## How to Play

- **Tap** anywhere or press **SPACE** to flip between floor and ceiling lanes
- Avoid the red obstacles
- Survive as long as possible to get a high score
- Share your score with the Share button on game over

## How to Run

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to play locally.

## Controls

- **Mobile**: Tap anywhere on screen
- **Desktop**: Click anywhere or press SPACE

---

# Original Template Documentation

A clean, reusable starter template for building Farcaster Mini Apps with:
- **Next.js 15** (App Router)
- **Neynar API** integration
- **Farcaster Mini App** metadata baked in
- **QuickAuth** sign-in
- **Vercel-ready** deployment
- **Mobile-first AI-assisted** dev workflow

This template is designed to be duplicated for every new mini app you create — no more wrestling with monorepos, mismatched configs, or missing metadata. Everything required for a functioning Farcaster Mini App is pre-wired and ready to extend.

---

## 🚀 Why This Template Exists

Farcaster Mini Apps require a very specific setup:
- Correct metadata (`fc:miniapp`) in the `<head>`
- Correct `.well-known/farcaster.json` manifest
- QuickAuth integration
- Neynar sign-in endpoints
- Vercel configuration
- App Router file structure
- Strict domain → frame matching
- SSR-safe miniapp SDK usage
- A clean sign-in → content UI flow

Getting these pieces wrong — even slightly — leads to:
- "No embed found"
- White screen inside the mini-app shell
- Invalid signer state errors
- Wrong domain association
- Broken QuickAuth session
- Missing assets in Vercel builds

**This template gives you:**

👉 A known-good, production-proven Farcaster Mini App foundation.
👉 A simple place to plug in custom features, game logic, AI features, or APIs.
👉 A repeatable workflow so every new app starts with a perfect baseline.

---

## 🧱 Project Structure

```
miniapp-template/
│
├── app/
│   ├── layout.tsx        → Root layout + fc:miniapp metadata
│   ├── page.tsx          → Main screen (sign-in → content)
│   ├── config.ts         → App branding/config
│   └── api/
│       ├── health/       → Health check endpoint
│       └── neynar/
│           └── me/       → QuickAuth session lookup
│
├── components/
│   ├── AuthCard.tsx      → Sign-in UI component
│   └── (Add your components here)
│
├── hooks/
│   └── useAuthSession.ts → Wraps QuickAuth user session
│
├── lib/
│   ├── neynar.ts         → Neynar API helper
│   ├── neynarClient.ts   → Neynar SDK client
│   └── text.ts           → Text utilities
│
├── public/
│   ├── embed-preview.png → (Add your 1200x630 preview image)
│   └── .well-known/
│       └── README.md     → Manifest info
│
├── docs/
│   └── template_clone_guide.md → Complete usage guide
│
├── vercel.json           → Vercel build config
├── .env.example          → Environment variable template
└── README.md             → This file
```

Everything follows a minimal, intuitive layout so you never lose track of where anything lives.

---

## 🔑 Features Included

### ✔️ QuickAuth Sign-in

User hits "Sign In" → Farcaster login → Mini App session available.

### ✔️ Mini App Metadata Built-in

The template includes a working:

```typescript
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
  })
}
```

Fully compatible with Farcaster's mini-app embedding system.

### ✔️ Neynar API Wiring

Just drop in your API key.

Includes working:
- `GET /api/neynar/me`
- `NeynarClient` helper

### ✔️ Vercel-Ready

The template deploys to Vercel without special configuration.

### ✔️ App Router (Next.js 15)

Future-proof, fully compatible with the latest Next.js features.

---

## 📱 Recommended Mobile-First Building Flow

This template was designed around a proven workflow:

### 1. Use ChatGPT (or any AI) to design features + generate prompts

ChatGPT handles:
- Architecture
- API planning
- UI structure
- Data flow
- Detailed Claude prompts

### 2. Paste those prompts into Claude Code

Claude Code handles:
- File edits
- Creating routes
- Implementing UI
- Adding APIs
- Cleaning imports
- Refactoring
- Branch creation + PRs

### 3. Claude Code pushes changes to GitHub

Each change:
- Creates a branch
- Makes a PR
- Provides a diff summary
- Ensures the app stays clean & working

### 4. Vercel automatically builds + deploys

You test entirely from your phone using:
- Farcaster Mini App previewer
- Domain preview inside casts
- Safari/Chrome mobile view

**This means you can build full apps without touching a laptop.**

---

## 🧩 How to Use This Template

### Option A — For a new mini app

1. Click "Use this template" on GitHub
2. Name your new repo
3. Update:
   - `app/config.ts` (app name, description, domain)
   - `.env.local` (API keys)
   - `public/embed-preview.png` (1200x630 preview image)
4. Deploy to Vercel
5. Run the Previewer → verify the embed
6. Build your app feature-by-feature

### Option B — Replacing the template when you improve it

If you update this template in the future:
- Use it as the new base
- Each new mini app starts from this repo

This keeps all your future projects aligned and avoids repeating the same setup issues.

---

## 🔒 Environment Setup

Copy `.env.example` → `.env.local`:

```env
NEYNAR_API_KEY=your_key
APP_BACKEND_URL=https://YOUR_DOMAIN.vercel.app
```

If you want OpenAI in future apps:

```env
OPENAI_API_KEY=your_key_here
```

Get your Neynar API key from [neynar.com](https://neynar.com).

---

## 🧪 Local Development

```bash
pnpm install
pnpm dev
```

Visit:

```
http://localhost:3000
```

---

## 🌐 Recommended Deployment Flow

1. Create a new Vercel project
2. Connect your GitHub repo
3. Add your env vars:
   - `NEYNAR_API_KEY`
   - `APP_BACKEND_URL` (set to your production URL)
4. Deploy
5. Publish the domain
6. Update `app/config.ts` with your production domain:
   ```typescript
   domain: 'your-app.vercel.app'
   ```
7. Redeploy
8. Test in Farcaster with:
   ```
   https://YOUR_DOMAIN.vercel.app
   ```

---

## 🎯 Quick Start Checklist

- [ ] Clone/fork this template
- [ ] Update `app/config.ts` with your app details
- [ ] Add `NEYNAR_API_KEY` to `.env.local`
- [ ] Run `pnpm install && pnpm dev`
- [ ] Verify sign-in works locally
- [ ] Add your preview image to `public/embed-preview.png`
- [ ] Deploy to Vercel
- [ ] Update `domain` in `app/config.ts` with production URL
- [ ] Test in Warpcast

---

## 🟣 You're Ready to Build

This template gives you:
- A working Farcaster Mini App shell
- Clean sign-in flow
- Neynar integration
- Vercel hosting
- Metadata wired correctly
- A layout that won't break inside the frame
- A development workflow that works entirely from your phone

**From here, you can add:**
- AI agents
- Games
- Interactive UIs
- Database layers
- Autonomous posters
- Anything else your Farcaster ecosystem needs

---

## 📚 Documentation

- **[Template Clone Guide](docs/template_clone_guide.md)** - Complete step-by-step guide for building on this template
- **[Farcaster Docs](https://docs.farcaster.xyz/)** - Official Farcaster documentation
- **[Mini App SDK](https://github.com/farcasterxyz/miniapp-sdk)** - Farcaster Mini App SDK
- **[Neynar API](https://docs.neynar.com/)** - Neynar API documentation

---

## 📝 License

MIT
