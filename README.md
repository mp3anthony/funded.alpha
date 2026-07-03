# funded.

**Fund the house first. Everything else comes second.**

Funded is a household cash-flow app that answers one question per payday: *how much should each person transfer to cover the bills?* It isn't a budgeting tool that tracks every coffee — it calculates each contributor's share of household expenses so bills are covered before personal spending begins.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Project structure](#project-structure)
- [Screens](#screens)
- [Design system](#design-system)
- [Key logic](#key-logic)
- [PWA support](#pwa-support)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [License](#license)
- [Credits](#credits)

---

## Features

- **Payday transfers** — enter income per contributor and the app calculates exact weekly transfer amounts to cover household bills in full
- **Bill tracking** — manage bills across any frequency (weekly, bi-weekly, monthly, yearly) with paid/due-soon/overdue status tracking
- **Frequency normalisation** — all bills convert to a common frequency for apples-to-apples comparison
- **Savings goals** — sinking funds with targets, progress tracking, and manual top-ups
- **Contribution rules** — define rules that auto-allocate surplus income above a threshold to goals or increased contributions
- **Payment modes** — choose between Joint Fund (pooled pot) or Direct Pay (split bills between members)
- **Multi-member households** — invite members via join code, manage roles (owner/member), and assign bill splits
- **Health score** — weighted financial health score (0–100) based on bill status, goal progress, and budget coverage
- **Light and dark mode** — automatic via `prefers-color-scheme`, with a manual toggle in settings
- **PWA** — installable as a home screen app on iOS Safari and Android Chrome with full offline fallback
- **Authentication** — email/password auth via Supabase with PKCE flow and email confirmation

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) with CSS custom properties |
| Icons | [Lucide React](https://lucide.dev/) |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage + Edge Functions) |
| Auth | Supabase Auth (PKCE flow, email confirmation) |
| File storage | Supabase Storage (avatar uploads) |
| Utilities | clsx, tailwind-merge |

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** (ships with Node)
- A **Supabase** project ([create one free](https://supabase.com/dashboard))

---

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/mp3anthony/funded.alpha.git
cd funded-nextjs

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.local.example .env.local
# Then fill in your Supabase credentials (see below)

# 4. Run the database migrations (see Database setup)

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Environment variables

Create a `.env.local` file in the project root with the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are available in your Supabase project dashboard under **Settings → API**.

> **Note:** `.env*` files are git-ignored by default. Never commit real credentials.

---

## Database setup

The Supabase schema is defined in the `supabase/` directory. Run these SQL files in order via the Supabase SQL Editor:

1. **`supabase/schema.sql`** — core tables: `households`, `bills`, `funds`, `paydays`
2. **`supabase/household_members_table.sql`** — the `household_members` table
3. **`supabase/rls_policies.sql`** — row-level security policies
4. **`supabase/secure_rls_policies.sql`** — additional hardened RLS rules
5. **`supabase/migrations/`** — apply each migration file in order:
   - `add_missing_schema_tables_and_columns.sql` — pay schedules, pay history, bill splits, household contributions, contribution rules, and additional columns
   - `add_user_id_and_constraints.sql` — user ID foreign keys and constraints
   - `add_join_code.sql` — household join codes
   - `update_join_code_type.sql` — join code type update
   - `fix_households_rls.sql` — RLS policy fixes
   - `fix_households_rls_recursion.sql` — recursive RLS fix
   - `fix_household_members_select.sql` — member select policy fix

### Edge Functions

- **`supabase/functions/join-household/`** — serverless function that handles household join code validation and member addition

### Storage

Create an `avatars` bucket in Supabase Storage (Settings → Storage) with **public access** enabled for avatar image uploads.

---

## Project structure

```
funded-nextjs/
├── public/
│   ├── icons/                # PWA icons (192×192, 512×512)
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker (offline support)
│   └── logo-wordmark.svg     # Brand wordmark
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout (fonts, metadata, providers)
│   │   ├── globals.css       # Design tokens + Tailwind v4 theme
│   │   ├── page.tsx          # Dashboard (home)
│   │   ├── auth/             # Auth callback handler
│   │   ├── bills/            # Bills management page
│   │   ├── confirm-email/    # Email confirmation page
│   │   ├── funds/            # Savings goals page
│   │   ├── login/            # Login / sign-up page
│   │   ├── offline/          # Offline fallback page
│   │   ├── payday/           # Payday income + schedules page
│   │   └── settings/         # Household settings page
│   ├── components/           # Reusable UI components (37 components)
│   │   ├── AppShell.tsx      # Auth guard, onboarding gate, bottom nav shell
│   │   ├── Onboarding.tsx    # 5-step onboarding wizard
│   │   ├── BottomNav.tsx     # Mobile bottom navigation bar
│   │   ├── HealthScoreCard.tsx   # Dashboard health score widget
│   │   ├── UpcomingBillsCard.tsx  # Dashboard upcoming bills widget
│   │   ├── ActiveGoalsCard.tsx    # Dashboard goals widget
│   │   ├── RecentActivityCard.tsx # Dashboard activity feed
│   │   ├── AddBillSheet.tsx       # Add/edit bill bottom sheet
│   │   ├── BillDetailSheet.tsx    # Bill detail view bottom sheet
│   │   ├── AddGoalSheet.tsx       # Add goal bottom sheet
│   │   ├── EditGoalSheet.tsx      # Edit goal bottom sheet
│   │   ├── GoalDetailSheet.tsx    # Goal detail view bottom sheet
│   │   ├── AddPayScheduleSheet.tsx    # Add pay schedule bottom sheet
│   │   ├── PayScheduleDetailSheet.tsx # Pay schedule detail sheet
│   │   ├── EnterPayAmountModal.tsx    # Variable pay entry modal
│   │   ├── PayHistoryCard.tsx         # Pay history timeline
│   │   ├── ContributionSettingsSheet.tsx # Contribution management
│   │   ├── RulesSettingsSheet.tsx      # Surplus rules configuration
│   │   ├── ContributorSplits.tsx       # Bill split assignment (Direct Pay)
│   │   ├── PaymentModeToggle.tsx       # Joint Fund / Direct Pay toggle
│   │   ├── JoinHouseholdSheet.tsx      # Join via code sheet
│   │   ├── EditMemberModal.tsx         # Edit household member
│   │   ├── RemoveMemberModal.tsx       # Remove household member
│   │   ├── AvatarUpload.tsx            # Avatar image upload
│   │   ├── AvatarDropdown.tsx          # Avatar selection dropdown
│   │   ├── Logo.tsx                    # Funded logo component
│   │   ├── PageHeader.tsx              # Consistent page header
│   │   ├── FrequencyToggle.tsx         # Frequency selector toggle
│   │   └── ...                         # Additional UI components
│   ├── context/
│   │   └── AppContext.tsx    # Global state provider (auth, data, CRUD)
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client initialisation
│   │   ├── storage.ts        # Avatar upload/delete/get utilities
│   │   └── utils.ts          # Shared helpers (health score, date, frequency conversion)
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces
├── supabase/
│   ├── schema.sql            # Core database schema
│   ├── household_members_table.sql
│   ├── rls_policies.sql      # Row-level security
│   ├── secure_rls_policies.sql
│   ├── migrations/           # Incremental schema migrations
│   └── functions/            # Supabase Edge Functions
├── .env.local                # Environment variables (git-ignored)
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.mjs        # PostCSS (Tailwind v4)
├── eslint.config.mjs         # ESLint configuration
└── package.json
```

---

## Screens

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | **Dashboard** | Health score, upcoming bills, active goals, recent activity feed |
| `/payday` | **Payday** | Pay schedules, income entry (fixed or variable), pay history, surplus rule triggers |
| `/bills` | **Bills** | All household bills with status badges, category filters, search, and frequency normalisation toggle |
| `/funds` | **Goals** | Savings goals with progress bars, manual top-ups, and completion tracking |
| `/settings` | **Settings** | Household name, payment mode (Joint Fund / Direct Pay), member management, contributions, surplus rules, theme toggle, join codes |
| `/login` | **Login** | Email/password authentication (sign in or sign up) |
| `/confirm-email` | **Confirm Email** | Email verification landing page |
| `/auth` | **Auth Callback** | Supabase auth redirect handler |
| `/offline` | **Offline** | PWA offline fallback page |

### User flow

1. **Sign up** → email confirmation → **Onboarding** (5 steps: name household, choose payment mode, add first pay schedule, add first bill, review)
2. **Dashboard** shows household health at a glance
3. **Payday** to log income when paid — surplus rules fire automatically
4. **Bills** to manage household costs
5. **Goals** to track savings targets
6. **Settings** to invite members, configure contributions and rules

---

## Design system

### Typography

Fonts are loaded via `next/font/google` for optimal performance (no external CDN requests at runtime).

| Font | CSS Variable | Use |
|------|-------------|-----|
| **Syne** (400–800) | `--font-heading` | Display headings, wordmark |
| **Instrument Sans** (400–600) | `--font-body` | Body text, inputs, UI labels |
| **JetBrains Mono** (400–600) | `--font-mono` | Numeric values, monospace data |

### Colour tokens

All colours are defined as CSS custom properties in `globals.css` and mapped into Tailwind v4 via `@theme inline`.

| Token | Dark mode | Light mode |
|-------|-----------|------------|
| `--color-primary` (lime) | `#c8ff00` | `#7aaa00` |
| `--color-background` | `#0a0a0a` | `#f2f2ee` |
| `--color-success` (green) | `#00e676` | `#00994a` |
| `--color-accent` (amber) | `#ffab00` | `#c07800` |
| `--color-destructive` (red) | `#ff3d57` | `#cc2233` |
| `--color-surface` | `#111111` | `#e8e8e4` |
| `--color-foreground` | `#f0f0f0` | `#0f0f0f` |
| `--color-muted` | `#999999` | `#444444` |
| `--color-border` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.09)` |

### Theme switching

- **Automatic:** respects `prefers-color-scheme` media query
- **Manual:** toggle in Settings applies `.dark` / `.light` class to `<html>`
- **Layered surfaces:** `--color-surface`, `--color-surface-raised`, `--color-surface-elevated` provide depth

### Mobile-first considerations

- `viewport-fit=cover` and `env(safe-area-inset-*)` padding for notched devices
- All inputs forced to `font-size: 16px` to prevent iOS Safari auto-zoom
- `touch-action: manipulation` on interactive elements to eliminate tap delay

---

## Key logic

### Frequency conversion

`convertAmount(amount, fromFrequency, toFrequency)` normalises any amount between `weekly`, `bi-weekly`, `monthly`, and `yearly` using standard budgeting coefficients (4.33 weeks/month, 2.16 bi-weeks/month).

### Health score

`calculateHealthScore()` returns 0–100 based on three weighted factors:

| Factor | Weight | Scoring |
|--------|--------|---------|
| Bills management | 40% | –20 points per overdue bill |
| Goals & contributions | 30% | 80 base + 20 if any goal has progress; 50 if nothing set up |
| Budget coverage | 30% | Ratio of contributions (or splits) to total monthly expenses |

### Payment modes

| Mode | Behaviour |
|------|-----------|
| **Joint Fund** | All contributors pay into a shared pot; contributions are compared against total bills |
| **Direct Pay** | Bills are split between specific members via `BillSplit` records; each person pays their assigned share |

### Contribution rules

When a pay entry exceeds a contributor's threshold, a configurable percentage is automatically allocated to a goal or added as an increased contribution.

---

## PWA support

Funded is a Progressive Web App. The following files enable installation and offline support:

| File | Purpose |
|------|---------|
| `public/manifest.json` | App name, theme colour (`#c8ff00`), icons, display mode (`standalone`) |
| `public/sw.js` | Service worker with cache-first strategy and offline fallback |
| `public/icons/` | App icons at 192×192 and 512×512 |
| `src/app/offline/` | Offline fallback page |

The service worker is **automatically unregistered in development** (localhost) and only registers in production.

---

## Deployment

### Netlify (current)

The app is currently deployed on Netlify:

| | |
|-|-|
| **Live URL** | [fundedalpha.netlify.app](https://fundedalpha.netlify.app/) |
| **Feedback form** | [Microsoft Forms](https://forms.office.com/r/eCyJuX9JW9) |

### Vercel (alternative)

```bash
npm run build
# Deploy via Vercel CLI or Git integration
```

### Environment variables

Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured in your deployment platform's environment settings.

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm run build` to verify
4. Open a pull request with a clear description of the change

### Code conventions

- **TypeScript** — strict types, no `any` unless explicitly suppressed with a comment
- **Components** — one component per file, `PascalCase` filenames
- **State** — centralised in `AppContext.tsx`; pages consume via `useApp()` and `useCurrentUser()` hooks
- **Styling** — Tailwind utility classes referencing CSS custom property tokens; avoid hard-coded colour values

---

## Versioning

| Change type | Version impact | Example |
|-------------|---------------|---------|
| Bug fix, no feature change | Patch (fourth decimal) | `v0.2.2` → `v0.2.2.1` |
| Feature addition or change | Minor (third decimal, patch resets) | `v0.2.2.2` → `v0.3.0` |
| Testing-ready build | `v0.10.0` | |
| Public beta | `v1.0.0` | |

---

## License

Private — all rights reserved.

---

## Credits

```
Concept & Development: Anthony Paull
Built with Antigravity IDE
```
