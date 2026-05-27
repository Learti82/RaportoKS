# RaportoKS — Platforma Civike e Kosovës

Kosovo's civic issue reporting platform. Citizens photograph and report street problems, reports are mapped publicly, and municipalities are held accountable through a public dashboard.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Clerk** — authentication
- **Supabase** — PostgreSQL + Storage + Realtime
- **Tailwind CSS** + custom shadcn/ui components
- **react-leaflet** + Leaflet.js — interactive maps
- **Anthropic Claude API** — AI auto-categorization
- **recharts** — statistics charts
- **sonner** — toast notifications

## Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account
- [Clerk](https://clerk.com) account
- [Anthropic](https://console.anthropic.com) API key

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd RaportoKS
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste + run the contents of `supabase-schema.sql`
3. Go to **Storage** → create a bucket named `report-photos`
   - Set it as **Public**
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
   - Max file size: 10MB

### 3. Set up Clerk

1. Create a new application at [clerk.com](https://clerk.com)
2. Enable **Email** and **Google** sign-in methods
3. Copy your publishable key and secret key

### 4. Configure environment variables

Copy `.env.local` and fill in your keys:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RaportoKS
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Seed the database

After setting up Supabase, insert 25 realistic Kosovo reports:

```bash
npx ts-node --project tsconfig.json -e "require('dotenv').config({path:'.env.local'})" scripts/seed.ts
```

Or install ts-node globally:
```bash
npm install -g ts-node
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed.ts
```

## Make yourself an admin

1. Sign up/in to your RaportoKS instance
2. Go to **Clerk Dashboard** → **Users** → find your user
3. Click **Metadata** → add to Public Metadata:
   ```json
   { "role": "admin" }
   ```
4. You now have access to `/admin`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with map + latest reports |
| `/harta` | Full-screen map of all reports |
| `/lista` | Paginated list with filters |
| `/statistika` | Public stats dashboard with charts |
| `/raport/i-ri` | 3-step report submission form (auth required) |
| `/raport/[id]` | Report detail with comments + status timeline |
| `/profili` | User profile + my reports (auth required) |
| `/admin` | Admin dashboard (admin role required) |
| `/admin/raporte/[id]` | Manage individual report status |
| `/sign-in` | Clerk sign-in page |
| `/sign-up` | Clerk sign-up page |

## Deployment (Vercel)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

## Features

- 🗺️ **Interactive map** — all reports as colored pins by category
- 📸 **Photo upload** — direct to Supabase Storage
- 🤖 **AI categorization** — Claude auto-detects problem category from description
- 📊 **Statistics dashboard** — donut charts, bar charts, 30-day line chart
- 🔴 **Real-time count** — Supabase Realtime updates report total live
- 🌍 **Albanian UI** — full Albanian interface
- 📱 **Mobile-first** — bottom nav bar on mobile
- 🌙 **Dark mode** — system preference respected
- 🔐 **Role-based access** — admin panel protected by Clerk metadata
