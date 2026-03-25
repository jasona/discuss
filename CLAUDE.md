# Discuss — Collaborative Knowledge Base

## What This Is

Multi-tenant SaaS knowledge base app. Teams create organizations (each gets a subdomain), organize content into spaces and pages, and collaborate with rich-text editing, comments, and @mentions.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM (with `@prisma/adapter-pg`)
- **Auth:** Auth.js v5 (next-auth beta) with JWT strategy, Credentials + Google + GitHub providers
- **Payments:** Stripe (checkout sessions, billing portal, webhooks)
- **Editor:** Tiptap rich-text editor with markdown import/export
- **UI:** ShadCN components in `src/components/ui/`, Tailwind CSS, Lucide icons
- **Fonts:** Geist Sans + Geist Mono (configured in root layout)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (use to verify no type errors)
npm test             # Run tests (vitest)
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, invite pages (no sidebar)
│   ├── (dashboard)/         # Main app behind auth + org context
│   │   ├── [spaceId]/       # Space and page views
│   │   └── settings/        # General, members, billing, archived
│   ├── auth/set-tenant/     # Sets tenant cookie after login
│   ├── onboarding/          # Org creation (NOT inside dashboard group)
│   ├── public/[slug]/       # Public shared page view (no auth)
│   └── api/
│       ├── auth/            # Auth.js handlers + post-login redirect
│       ├── webhooks/stripe/ # Stripe webhook handler
│       └── notifications/   # Notification goto redirect
├── components/
│   ├── ui/                  # ShadCN primitives
│   ├── editor/              # Tiptap editor, toolbar, viewers
│   ├── sidebar/             # Space tree, org switcher
│   ├── comments/            # Threaded comments, comment form
│   ├── sharing/             # Share dialog
│   ├── notifications/       # Notification bell + popover
│   ├── search/              # Cmd+K command palette
│   └── app-shell.tsx        # Main layout shell with sidebar
├── lib/
│   ├── actions/             # Server actions (spaces, pages, comments, etc.)
│   ├── auth.ts              # requireAuth(), requireOrg() helpers
│   ├── auth.config.ts       # Auth.js configuration
│   ├── db.ts                # Prisma client singleton
│   ├── tenant.ts            # URL builders (getTenantUrl, getRootUrl)
│   ├── tenant.server.ts     # getTenantSlug() from request headers/cookies
│   ├── constants.ts         # Roles, plan limits, app config
│   ├── permissions.ts       # Role-based permission checks
│   ├── plan-limits.ts       # Plan limit enforcement utilities
│   └── stripe/client.ts     # Stripe client
├── generated/prisma/        # Auto-generated Prisma client (do not edit)
└── design-drafts/           # Output directory for /make command drafts
```

## Multi-Tenant Architecture

- **Production:** Subdomain-based (`acme.discusslabs.com`)
- **Development:** Cookie-based tenant on IP/localhost — middleware reads `tenant` cookie from requests
- **Middleware (`src/middleware.ts`):** Extracts subdomain or falls back to `tenant` cookie, forwards slug to server components via `x-tenant-slug` request header
- **`getTenantSlug()`** reads from request headers first, cookie fallback
- **Login flow:** Login → `/api/auth/post-login` (finds user's org) → `/auth/set-tenant?slug=X` (sets cookie) → `/` (dashboard)

## Key Patterns

### Server Actions
All data mutations go through server actions in `src/lib/actions/`. Each action calls `getOrgContext()` to get the authenticated user and their org, then checks permissions before proceeding.

### Route Groups
- `(auth)` — No sidebar, no org context required
- `(dashboard)` — Wrapped in `AppShell`, requires org membership via `requireOrg()`
- `/onboarding` — Standalone route (user has no org yet, must NOT be in dashboard group)

### Permissions
Hierarchy: `owner > admin > editor > viewer`. Use `isAtLeast(role, "admin")` for checks. Space-level roles can override org-level roles.

### Plan Limits
Defined in `PLAN_LIMITS` in `constants.ts`. Free: 5 users, 3 spaces, 0 external shares. Limits are checked in server actions before mutations.

## Environment Variables

Key vars in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST` — Auth.js config
- `NEXT_PUBLIC_APP_DOMAIN` — Base domain (IP address in dev)
- `NEXT_PUBLIC_APP_URL` — Full app URL with port
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe server-side
- `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID` — Stripe price IDs

## Known Gotchas

- **ShadCN version:** `DialogTrigger` and similar components do NOT support `asChild` prop. Style the trigger directly via className instead.
- **Prisma client location:** Generated to `src/generated/prisma/`, imported as `@/generated/prisma/client`
- **Prisma config:** Uses `prisma.config.ts` at project root with `dotenv/config` — reads from `.env` not `.env.local` for CLI commands. The app itself reads `.env.local` fine via Next.js.
- **Next.js 16:** Shows deprecation warning about middleware → proxy migration. Ignore for now; middleware still works.
- **Routing conflicts:** Never create both `app/page.tsx` and `app/(group)/page.tsx` for the same URL path. The root boilerplate `app/page.tsx` was removed.

## Design System

- `/make` command outputs to `src/design-drafts/` for review before integration
- `/iterate` command refines drafts in place
- Design principles are in `prompts/system-prompt.md`

## Task Tracking

Feature progress is tracked in `docs/tasks-discuss-mvp.md`. Tasks 1–12 are complete. Task 13 (UI polish) remains.
