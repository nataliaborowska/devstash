# Current Feature: Auth Phase 3 - Sign In, Register & Sign Out UI

## Status

In Progress

## Goals

- Custom `/sign-in` page replaces the NextAuth default: email + password fields, "Sign in with GitHub" button, link to register, form validation with error display
- Custom `/register` page: name, email, password, confirm password fields; validates email format and matching passwords; submits to `/api/auth/register`; redirects to `/sign-in` on success
- Bottom of sidebar shows the signed-in user's avatar and name
- Clicking the avatar opens a dropdown with two options: "Profile" (navigates to `/profile`) and "Sign out" (logs the user out and redirects)
- Reusable avatar component: uses the GitHub `image` when present, otherwise initials from the name (e.g., "Brad Traversy" → "BT")

## Notes

- Spec: `context/features/auth-phase-3-spec.md`
- Builds on Auth Phase 1 (NextAuth v5, JWT, GitHub, proxy-protected `/dashboard/*`) and Phase 2 (Credentials provider, `POST /api/auth/register`)
- NextAuth config must point its sign-in page at `/sign-in` so protected routes redirect there instead of the default page
- Decision: the avatar click opens the dropdown only; `/profile` is reached through the dropdown's "Profile" option instead of a direct click
- Decision: the avatar goes at the bottom of the sidebar, not in the top bar (overrides the spec's testing step 4)
- Testing:
  1. `/sign-in` renders the custom page
  2. GitHub sign-in works
  3. Email/password sign-in works
  4. Avatar shows at the bottom of the sidebar (GitHub image or initials)
  5. Clicking the avatar opens the dropdown with "Profile" and "Sign out"; "Profile" goes to `/profile`
  6. "Sign out" logs out and redirects
  7. `/register` creates an account and redirects to `/sign-in`

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
- **2026-08-01** — Dashboard quick-win cleanups complete: `select` replaces `include` in `items.ts`/`collections.ts` to stop over-fetching item content on dashboard loads, `getPinnedItems()` gained a `limit` param, `item-card.tsx` dropped an unneeded `'use client'` and duplicated types, icon lookup consolidated into shared `icon-map.tsx` (new `TypeIcon` component), redundant `force-dynamic` removed from `page.tsx`, and a `loading.tsx` skeleton added for `/dashboard`
- **2026-09-13** — Auth Phase 1 complete: NextAuth v5 (`next-auth@beta`) + `@auth/prisma-adapter` installed, split edge-compatible config (`src/auth.config.ts` + `src/auth.ts`) with JWT strategy, GitHub OAuth provider, `/dashboard/*` routes protected via Next.js 16 proxy (`src/proxy.ts`) with sign-in redirect, Session type extended with `user.id` (`src/types/next-auth.d.ts`)
- **2026-09-13** — Auth Phase 2 complete: Credentials provider added alongside GitHub (`src/auth.config.ts` placeholder + `src/auth.ts` bcrypt `authorize`, sanitized to `{ id, name, email, image }`), `POST /api/auth/register` with Zod validation and normalized (trimmed/lowercased) email, default NextAuth `/api/auth/signin` page dark-themed via `theme.colorScheme` and auto-rendering the credentials form through field `label`/`type`; registration, credentials sign-in, and GitHub OAuth all verified working
