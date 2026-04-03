# The Hub — Personal Intelligence Dashboard

A multi-tenant web app where users paste any link, name, or URL and AI automatically categorizes it into custom pillars and subcategories.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database + Auth:** Supabase (Postgres + Supabase Auth + Row Level Security)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **AI:** Anthropic API (claude-haiku-4-5) for classification
- **Fonts:** Space Grotesk + DM Mono (Google Fonts)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/denglerman/thehub.git
cd thehub
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI classification |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for OAuth redirects) |

### 3. Supabase setup

1. Create a new Supabase project
2. Run the SQL migration in your Supabase SQL Editor:
   - Open `supabase/create_tables.sql`
   - Execute it in the SQL Editor
3. Enable **Google OAuth** in Supabase Auth dashboard:
   - Go to Authentication > Providers > Google
   - Enable and configure with your Google OAuth credentials
4. Add your site URL to the redirect URLs:
   - `http://localhost:3000/auth/callback` (for local dev)
   - `https://your-vercel-url.vercel.app/auth/callback` (for production)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push your repo to GitHub
2. Import the project in Vercel
3. Add all environment variables from `.env.local`
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL
5. Update the Supabase redirect URL to include your Vercel URL

## Features

- **Google OAuth** login via Supabase Auth
- **Onboarding** flow to set up hub name and pillars (2-4 custom categories)
- **Smart input bar** — paste any URL, name, or text and AI classifies it
- **Pillar tabs** with item counts and color-coded dots
- **Subcat pills** (candidate, person, company, conference, event, competition, paper, tool, resource, other)
- **Search** across all items with live filtering
- **Edit/delete** items with inline confirmation
- **Settings** panel to rename hub, manage pillars, sign out
- **Keyboard shortcut** — Ctrl+K / Cmd+K to focus the input bar
- **Framer Motion** animations on card entry
- **Mobile responsive** layout
- **Row Level Security** — all data is per-user

## Database Schema

See `supabase/create_tables.sql` for the full schema including:
- `user_profiles` — hub name, onboarding status
- `pillars` — user's custom categories (max 4)
- `hub_items` — classified items with AI-generated metadata
