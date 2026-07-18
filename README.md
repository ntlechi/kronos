# Kronos — Entrepreneur OS

Mobile-first PWA to track **time**, **capital**, **skills**, and **recharge** across brands and personal projects. Built so an operator running 10+ ventures can apply the 80/20 rule without burning out.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + SQLite (local Phase 1; schema is multitenant-ready for Postgres)
- PWA manifest + service worker

## Quick start

```bash
npm install
cp .env.example .env   # set AUTH_SECRET (+ optional Kit keys)
npm run db:setup
npm run icons
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Register** or sign in.

Demo seed account after `npm run db:seed`:
- Email: `janara@kronos.local`
- Password: `kronos-demo-2026`

### Auth + multitenant

- Each registration creates a **User + isolated Tenant workspace**
- APIs resolve `tenantId` from the session (not a shared demo tenant)
- Optional Kit (ConvertKit) opt-in on register (`KIT_API_KEY` + `KIT_FORM_ID`)

### Phone (PWA)

1. Deploy or open on your phone (same network / HTTPS URL)
2. **Add to Home Screen** — `manifest` is configured
3. Production builds register a **safe service worker** (icons only; no HTML cache loops)
4. Use **Log** for 2-second captures when you switch activities

## Phase 1 surfaces

| Route | Purpose |
|-------|---------|
| `/` | Day / week / month / year pulse + 80/20 + burnout floor + skill XP |
| `/log` | Activity picker, deep/shallow/recharge, minutes, cash, stopwatch |
| `/pomodoro` | Adjustable focus/break timer; completed focus auto-logs Deep Work |
| `/activities` | Create / rename brands, personal work & lifestyle counters |
| `/skills` | Create / rename skills and link them to activities (XP source) |

UI language: **EN / FR** toggle in the header (persisted in localStorage).

**Activity vs Project:** the UI says *Activity* (brands + lifestyle). The database still uses `Project` under the hood.

**Where skills come from:** seeded defaults for demo, then fully user-owned — create, rename, delete, and associate with activities. Logging time on a linked activity compounds that skill's XP.

## Seeded workspace

Demo tenant `janara` with projects: Kompul, Kapexnet, Bati, Survive Backpacking, Desjardins, Personal Ops, Dance, Sports, Social.

## Next phases

- Auth + real multitenant workspaces
- Postgres production database
- Survive Backpacking public free-tool edition
- Richer ROI / 80/20 recommendations
