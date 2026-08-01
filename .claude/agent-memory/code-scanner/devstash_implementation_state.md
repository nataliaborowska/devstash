---
name: devstash-implementation-state
description: Snapshot of what is actually implemented in DevStash as of the 2026-08-01 audit — use to avoid flagging planned/roadmap work as bugs
metadata:
  type: project
---

As of 2026-08-01 (commit 85e6782, master branch), DevStash has:

- Dashboard shell UI: `src/components/layout/{top-bar,sidebar,dashboard-shell}.tsx` — sidebar/collections/item-types are live from Neon DB via `src/lib/db/{items,collections}.ts`.
- `src/app/dashboard/{layout,page}.tsx` — both `force-dynamic`, fetch live stats/collections/items with `Promise.all`.
- Prisma 7 schema (`prisma/schema.prisma`) with NextAuth models (Account/Session/VerificationToken) already present in schema, but **no `lib/auth.ts`, no `[...nextauth]/route.ts`, no login/register pages exist yet** — auth is schema-ready but not wired up.
- No items/collections CRUD routes, no Server Actions (`src/actions/` doesn't exist), no API routes (`src/app/api/` doesn't exist), no AI features, no Stripe, no file upload (R2) code.
- Sidebar user info (`mockUser` from `src/lib/mock-data.ts`) is hardcoded ("John Doe" / demo@devstash.io) — expected placeholder since there's no session yet.
- Search bar and "New Item"/"New Collection" buttons in top-bar.tsx are non-functional placeholders (no onClick/onChange) — expected, planned work.
- No `tailwind.config.ts/js` — correctly uses Tailwind v4 CSS-based `@theme` config in `src/app/globals.css`. Compliant.
- No raw Prisma queries (`$queryRaw`/`$executeRaw`), no `dangerouslySetInnerHTML`, no `any` types found in `src/`.
- Prisma client instantiated only once, in `src/lib/prisma.ts` (adapter-based, `PrismaPg`). `prisma/seed.ts` instantiates its own `PrismaClient` — acceptable since seed scripts run standalone via `tsx` outside the Next.js app/path-alias context.

**Why this matters:** Don't flag "no auth", "no CRUD", "no rate limiting", "no AI/Stripe" as issues — these are known, planned, not-yet-built (see `context/current-feature.md` history and roadmap in `context/project-overview.md`).
**How to apply:** Before flagging a missing feature, check this snapshot and the roadmap section of project-overview.md first — but re-verify against current files since this state moves fast (check `context/current-feature.md` history for what's shipped since 2026-08-01).
