# Station — AI-Powered Placement Prep

## Overview

Station is a React + Express full-stack app that helps Indian students prepare for campus placements. It covers Engineering, Commerce, and Arts/Civil Services domains with AI-powered features.

## Architecture

- **Frontend**: React 18 + Vite (port 5000), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express server (port 3001), TypeScript, JWT auth
- **Database**: PostgreSQL via Drizzle ORM (`shared/schema.ts`)
- **AI**: OpenRouter API (`/api/chat` route on the server — key stays server-side)
- **State**: Zustand (`src/store/useStationStore.ts`)

## Key Features

- Domain-specific prep (Engineering/Commerce/Arts)
- AI Mock Interviews with real-time streaming feedback
- Speech Practice with AI analysis
- Interview Prep with company-specific coaching
- Weekly Study Plans, Quizzes, Vault
- Focus Timer, Social Feed, Leaderboard
- Profile + Theme switcher (6 themes)

## Project Structure

```
src/               # React frontend
  pages/           # Route pages (Landing, Login, Dashboard, etc.)
  pages/dashboard/ # All dashboard sub-pages
  components/      # Shared components (AppSidebar, FocusTimer, etc.)
  store/           # Zustand store (useStationStore.ts)
  lib/             # Utilities: ai.ts (streaming), auth.ts (client auth)
server/            # Express backend
  index.ts         # Main server (auth routes + /api/chat)
  db.ts            # Drizzle DB connection
shared/
  schema.ts        # Drizzle schema (users table)
```

## Environment Secrets Required

- `AI_API_KEY` — OpenRouter API key (https://openrouter.ai/keys)
- `JWT_SECRET` — Random secret string for signing JWTs
- `DATABASE_URL` — Auto-set by Replit PostgreSQL

## Development

```bash
npm run dev        # Runs both Vite (port 5000) and Express (port 3001) concurrently
npm run db:push    # Push schema changes to database
npm run build      # Build for production
```

## Deployment

Build command: `npm run build`
Run command: `node ./dist/index.cjs`

The Express server serves the built frontend statically in production.

## Auth Flow

- Email/password auth via `/api/auth/signup` and `/api/auth/login`
- JWT tokens stored in `localStorage` (`station_token`)
- `src/lib/auth.ts` handles all client-side auth calls
- No Supabase or Lovable dependencies — fully self-contained

## AI Chat

- Client calls `/api/chat` (relative URL, proxied in dev)
- Server calls OpenRouter with `AI_API_KEY` (never exposed to browser)
- Supports streaming SSE responses
- Modes: `mock-interview`, `interview-prep`, `self-intro-feedback`, `self-intro-generate`
