# CLAUDE.md — MoodBubble Project Guide

> This file is the single source of truth for AI assistants (and human teammates)
> working on the MoodBubble codebase. Read it before making any changes.

---

## Project Overview

**MoodBubble** is a map-based emotional journaling platform built for the
UNIHACK hackathon. Users record how they feel at specific locations and
visualize their emotional landscape over time through bubble-shaped markers on
a map.

**Core idea:** emotions → locations → visual bubbles on a map → personal
emotional landscape that grows over time.

---

## Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Framework    | **Next.js 16** (App Router, Turbopack)      |
| Language     | **TypeScript** (strict mode)                |
| Styling      | **Tailwind CSS v4**                         |
| Database     | **Supabase** (PostgreSQL + Auth + Storage)  |
| Map          | **React Leaflet** + OpenStreetMap (free)     |
| Deployment   | **Vercel** (auto-deploys from `main`)       |
| Package Mgr  | **npm**                                     |

---

## Directory Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (nav, fonts, metadata)
│   │   ├── page.tsx            # Landing / home page
│   │   ├── map/
│   │   │   └── page.tsx        # Full-screen map + add mood flow
│   │   ├── insights/
│   │   │   └── page.tsx        # Stats & recent entries (Server Component)
│   │   └── api/
│   │       └── moods/
│   │           ├── route.ts    # GET (list) / POST (create)
│   │           └── [id]/
│   │               └── route.ts # GET / PATCH / DELETE single entry
│   ├── components/             # Reusable React components
│   │   ├── MapView.tsx         # Leaflet map with markers
│   │   ├── MoodBubble.tsx      # Bubble marker (color + size)
│   │   ├── AddMoodModal.tsx    # Form modal for new entries
│   │   └── EntryCard.tsx       # Card displaying a single entry
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       ├── server.ts       # Server Supabase client (cookies)
│   │       └── middleware.ts   # Auth session refresh helper
│   ├── types/
│   │   └── database.ts        # TypeScript types for DB tables
│   ├── utils/
│   │   ├── emotion-color.ts   # Score → color mapping
│   │   ├── bubble-scale.ts    # Entry count → bubble size
│   │   └── categories.ts      # Emotion category metadata
│   └── middleware.ts           # Next.js middleware (Supabase session)
├── supabase/
│   ├── schema.sql              # DDL — run in Supabase SQL Editor
│   └── seed.sql                # Sample data for development
├── public/                     # Static assets
├── .env.local                  # Local secrets (NOT committed)
├── .env.example                # Template for .env.local
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- No map API key needed (uses free OpenStreetMap tiles via Leaflet)

### Setup

```bash
# 1. Clone & install
git clone git@github.com:HjsCS/Test-Subjects.git
cd Test-Subjects
npm install

# 2. Pull env vars from Vercel (requires Vercel CLI login)
vercel env pull .env.local
# Or manually: cp .env.example .env.local and fill in your keys

# 3. Set up the database
# Go to Supabase Dashboard → SQL Editor → paste & run supabase/schema.sql
# Optionally run supabase/seed.sql for sample data

# 4. Run dev server
npm run dev        # → http://localhost:3000
```

### Common Commands

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start dev server (Turbopack)   |
| `npm run build`  | Production build               |
| `npm run start`  | Serve production build locally |
| `npm run lint`   | Run ESLint                     |

---

## Environment Variables

All secrets live in `.env.local` (never committed). Use `vercel env pull .env.local`
to auto-populate from the Vercel × Supabase integration.

| Variable                         | Side    | Description                       |
| -------------------------------- | ------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Client  | Supabase project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Client  | Supabase anonymous/public key     |
| `SUPABASE_SERVICE_ROLE_KEY`      | Server  | Full-access key (bypass RLS)      |
| `SUPABASE_JWT_SECRET`            | Server  | JWT verification secret           |
| `POSTGRES_URL`                   | Server  | Pooled Postgres connection string |
| `POSTGRES_URL_NON_POOLING`       | Server  | Direct Postgres connection string |

On Vercel, these are auto-injected via the **Supabase integration** — no manual
configuration needed.

---

## Architecture Decisions

### Why Next.js App Router + API Routes (not separate backend)?

- **Single deployable unit** — frontend + API deploy together on Vercel.
- **No CORS issues** — API routes run on the same origin.
- **Server Components** — the Insights page fetches data server-side, zero
  client-side waterfalls.
- **Hackathon speed** — one repo, one deploy, one URL.

### Why Supabase (not Firebase)?

- **PostgreSQL** — real relational DB with SQL, indexes, enums, RLS.
- **Vercel integration** — env vars auto-injected via Supabase integration.
- **Generous free tier** — more than enough for hackathon + demo.
- **Row Level Security** — ready for real auth when needed.

### Why React Leaflet + OpenStreetMap (not Mapbox)?

- **Free** — no API key, no usage limits, no billing.
- **Open source** — OpenStreetMap tiles are community-maintained.
- **React-native API** — `react-leaflet` provides declarative components
  (`<MapContainer>`, `<Marker>`, `<Popup>`) that fit naturally into React.
- **Hackathon friendly** — zero setup, works immediately.

---

## Coding Conventions

### General

- **TypeScript everywhere** — no `.js` files in `src/`.
- **Strict mode** is ON in `tsconfig.json`.
- Use **absolute imports** via `@/` alias (e.g., `@/components/MapView`).
- File naming: **kebab-case** for utils (`emotion-color.ts`), **PascalCase** for components (`MapView.tsx`).

### React / Next.js

- Default to **Server Components**. Only add `"use client"` when you need
  browser APIs, hooks, or event handlers.
- API Route Handlers go in `src/app/api/` and export named HTTP method
  functions (`GET`, `POST`, `PATCH`, `DELETE`).
- Put shared UI in `src/components/`. Page-specific UI stays in the page file.

### Supabase

- **Browser** code → `import { createClient } from "@/lib/supabase/client"`
- **Server** code → `import { createClient } from "@/lib/supabase/server"`
- Never import the server client in a `"use client"` file.
- Types for DB rows are in `src/types/database.ts`. When the schema changes,
  update this file (or regenerate with `supabase gen types typescript`).

### Styling

- Use **Tailwind utility classes** directly. Avoid custom CSS unless
  absolutely necessary.
- Dark mode is supported via Tailwind's `dark:` variant (uses
  `prefers-color-scheme`).

### Git

- Branch naming: `feature/xxx`, `fix/xxx`, `refactor/xxx`.
- Commit messages: imperative mood, concise. E.g., `add mood entry API route`.
- Always verify `npm run build` passes before pushing.

---

## API Reference

### `GET /api/moods`

Query params: `?user_id=xxx`, `?visibility=private|friends`

Returns: `MoodEntry[]`

### `POST /api/moods`

Body: `{ user_id, latitude, longitude, emotion_score, category, note?, media_url?, visibility }`

Returns: `MoodEntry`

### `GET /api/moods/:id`

Returns: `MoodEntry`

### `PATCH /api/moods/:id`

Body: partial `MoodEntry` fields to update.

Returns: updated `MoodEntry`

### `DELETE /api/moods/:id`

Returns: `{ message: "Deleted" }`

---

## Database Schema

See `supabase/schema.sql` for the full DDL. Key table:

**`mood_entries`**

| Column         | Type               | Notes                    |
| -------------- | ------------------ | ------------------------ |
| id             | uuid (PK)          | Auto-generated           |
| user_id        | text               | Placeholder until auth   |
| latitude       | double precision   |                          |
| longitude      | double precision   |                          |
| emotion_score  | integer            | 1–10                     |
| category       | emotion_category   | Enum (see types)         |
| note           | text               | Optional                 |
| media_url      | text               | Optional                 |
| visibility     | visibility         | 'private' or 'friends'   |
| created_at     | timestamptz        | Auto-generated           |

---

## MVP Scope (48-hour Hackathon)

### Must Have

- [x] Map interface with Mapbox
- [x] Create emotional entry (tap map → fill form → save)
- [x] Emotion categories
- [x] Bubble-based markers (color = emotion, size = frequency)
- [x] Entry detail view (popups + cards)
- [x] Private map mode
- [x] Basic insights page (stats + distribution)

### Nice to Have (Next Steps)

- [ ] Supabase Auth (replace `anonymous` user_id)
- [ ] Photo/video upload via Supabase Storage
- [ ] Bubble clustering (aggregate nearby entries)
- [ ] Timeline filters (today / week / month / custom)
- [ ] Friends map mode (24-hour entries)
- [ ] Location-based memory reminders
- [ ] Personal recap summary page
- [ ] Mobile-responsive optimizations

---

## Deployment

The project is configured for **Vercel**:

1. Connect the GitHub repo to Vercel.
2. Set environment variables in Vercel dashboard.
3. Every push to `main` auto-deploys.
4. Preview deployments are created for every PR.

If using the **Vercel × Supabase integration**, Supabase env vars are
injected automatically — no manual configuration needed.

---

## Troubleshooting

| Problem                           | Solution                                                   |
| --------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` empty  | Check `.env.local` exists and has correct values            |
| Map doesn't load                  | Check browser console; Leaflet CSS may be missing           |
| DB queries return empty           | Run `supabase/schema.sql` in SQL Editor, then `seed.sql`   |
| Build fails with type errors      | Run `npm run build` locally, fix TS errors before pushing   |
| Middleware deprecation warning     | Next.js 16 warning — safe to ignore for now                |
