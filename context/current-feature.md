# Dashboard Quick-Win Cleanups

Code quality quick-win fixes from the 2026-08-01 code-scanner audit — low/no-risk cleanups only, no behavior-changing or auth-adjacent items.

## Status

In Progress

## Goals

- [x] `src/lib/db/items.ts` / `src/lib/db/collections.ts` — replace `include` with `select` limited to the fields actually consumed (`mapItem`, dominant-type calc), so dashboard queries stop pulling the full `content` text field and unused columns
- [x] `src/lib/db/items.ts` — add a `limit` param (with sane default) to `getPinnedItems()`, matching the pattern already used by `getRecentItems` / `getFavoriteCollections` / `getNonFavoriteCollections`
- [x] `src/components/dashboard/item-card.tsx` — remove unnecessary `'use client'` directive (no state/handlers require it)
- [x] `src/components/dashboard/item-card.tsx` — drop local `Item`/`ItemType` interfaces, import `ItemWithType` from `src/lib/db/items.ts` instead
- [x] `src/components/dashboard/item-card.tsx` / `src/components/dashboard/collection-card.tsx` — remove locally duplicated `ICON_MAP`, use shared `getTypeIcon()` from `src/lib/icon-map.ts`; fixes `collection-card.tsx` silently rendering nothing for unknown icons instead of a fallback
- [x] `src/app/dashboard/layout.tsx` / `src/app/dashboard/page.tsx` — remove redundant duplicate `dynamic = "force-dynamic"` (keep on layout only)
- [x] `src/app/dashboard/loading.tsx` — add a skeleton loading state for the dashboard route

## Notes

Source: code-scanner audit findings, 2026-08-01. Excluded from this pass (need separate follow-up, not quick wins):
- `userId` scoping gap in `src/lib/db/items.ts` / `collections.ts` — must be resolved alongside the auth implementation, not before
- Sidebar "Pro" badge on Images vs. monetization docs table — product decision, needs user confirmation, not a code fix
- Next/React version drift in docs vs. `package.json` — doc-only, unrelated to this cleanup

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-05-18** — Initial Next.js 15 + Tailwind CSS setup committed and pushed to GitHub (`nataliaborowska/devstash`)
- **2026-05-20** — Dashboard Phase 1 complete: ShadCN initialized, Inter + JetBrains Mono fonts, dark mode by default, `/dashboard` route, top bar with logo/search/buttons, sidebar and main placeholders
- **2026-05-22** — Dashboard Phase 2 complete: collapsible sidebar with Types (icon links to `/items/[type]`), Collections (Favorites + Recent), user avatar area; desktop inline toggle, mobile hamburger + Sheet drawer
- **2026-05-28** — Dashboard Phase 3 complete: stats cards (items, collections, favorites), recent collections grid, pinned items, and 10 recent items in main content area
- **2026-05-30** — Database phase complete: Prisma 7 + Neon PostgreSQL configured, full schema with NextAuth models, initial migration applied, 7 system item types seeded
- **2026-05-30** — Seed data complete: demo user (`demo@devstash.io`), 7 system item types updated to Lucide icon names, 5 collections with 17 items (snippets, prompts, commands, links)
- **2026-06-04** — Dashboard collections complete: live data from Neon DB via Prisma, Lucide type icons, dominant-type colored left border accent, 3-column 2-row grid layout
- **2026-06-04** — Dashboard items complete: live pinned and recent items from Neon DB, Lucide type icons with colored left border accents, conditional pinned section, live stats cards
- **2026-07-19** — Stats & Sidebar complete: sidebar item types and collections (favorites + recent) now live from Neon DB via `getItemTypesWithCounts`, `getFavoriteCollections`, `getNonFavoriteCollections`; recent collections show a dominant-type colored dot; added "View all collections" link and animated collapsible carets for Types/Collections/Favorites/Recent groups
- **2026-07-26** — Pro badge complete: added shadcn/ui `Badge` component and a subtle uppercase "PRO" badge next to the Files and Images item types in the expanded sidebar
