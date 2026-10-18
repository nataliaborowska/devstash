# Current Feature: Email Verification Toggle

## Status

In Progress

## Goals

- Add an `EMAIL_VERIFICATION_ENABLED` env variable; verification is on only when it is exactly `"true"` (unset/anything else = off)
- Read the flag in one place (e.g. `isEmailVerificationEnabled()` in `src/lib/`) so every check uses the same logic
- When disabled: registration creates the user without creating a token or sending an email, so any email address can register
- When disabled: credentials sign-in does not require `emailVerified`
- When disabled: the register toast says the account was created and the user can sign in (not "check your inbox")
- When enabled: current behavior is unchanged (token + Resend email, sign-in blocked until verified)
- Add `EMAIL_VERIFICATION_ENABLED` to `.env` (off for now) and document it alongside `EMAIL_FROM`

## Notes

- Env var chosen over a DB/admin setting: it's a deploy-time switch, needs no schema change or UI, and can be set differently in `.env` and `.env.production`. Toggling requires a server restart / redeploy
- Opt-in (`"true"` to enable) so a missing variable never blocks registration while there's no Resend domain
- The flag is server-only (no `NEXT_PUBLIC_` prefix); the register API response should tell the form whether verification is required (e.g. `data.verificationRequired`) so the toast text matches
- Users registered while the flag is off keep `emailVerified = null`. If verification is turned on later, they'll be blocked from credentials sign-in until verified, and there's no "resend verification email" option yet. Revisit when a domain is added
- `/api/auth/verify-email` stays available either way so links already sent still work

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
- **2026-10-17** — Auth Phase 3 complete: custom `/sign-in` (GitHub + email/password via server actions, safe callback URLs, inline errors) and `/register` (shared Zod schema in `src/lib/validations/auth.ts`, posts to `/api/auth/register`, sonner toast then redirect to sign-in) replace the NextAuth default pages; NextAuth `pages` and the proxy point at `/sign-in`; sidebar shows the logged-in user loaded from the DB (`getSidebarUser`) with a reusable `UserAvatar` (GitHub image or initials) and a dropdown with Profile and Sign out; root `Toaster` added; React Compiler enabled
- **2026-10-18** — Email verification complete: `resend` installed, registration creates a 24h `VerificationToken` (SHA-256 hashed) and sends a verification email via Resend (`src/lib/email.ts`, `EMAIL_FROM` defaults to `onboarding@resend.dev`; user rolled back if sending fails), `GET /api/auth/verify-email` sets `emailVerified` and redirects to `/sign-in` with success or invalid-link message, credentials sign-in blocked for unverified emails via custom `EmailNotVerifiedError` (`CredentialsSignin` code), register toast now says to check inbox; added `scripts/delete-non-demo-users.ts` (dry run by default, `--confirm` to delete)
