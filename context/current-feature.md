# Current feature

Dashboard UI Phase 3 — main content area with stats, pinned items, recent collections, and recent items.

## Status

In Progress

## Goals

- 4 stats cards at the top: number of items, collections, favorite items, and favorite collections
- Recent Collections section
- Pinned Items section
- 10 Recent Items section
- Use mock data from `src/lib/mock-data.js` (import directly for now)

## Notes

- Reference screenshot: `context/screenshots/dashboard-ui-main.png`
- Stats cards are not in the screenshot but are required

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-05-18** — Initial Next.js 15 + Tailwind CSS setup committed and pushed to GitHub (`nataliaborowska/devstash`)
- **2026-05-20** — Dashboard Phase 1 complete: ShadCN initialized, Inter + JetBrains Mono fonts, dark mode by default, `/dashboard` route, top bar with logo/search/buttons, sidebar and main placeholders
- **2026-05-22** — Dashboard Phase 2 complete: collapsible sidebar with Types (icon links to `/items/[type]`), Collections (Favorites + Recent), user avatar area; desktop inline toggle, mobile hamburger + Sheet drawer
