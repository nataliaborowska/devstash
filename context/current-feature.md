# Current Feature: Forgot Password

## Status

In Progress

## Goals

- "Forgot password?" link on the `/sign-in` form (next to the password field) pointing to `/forgot-password`
- `/forgot-password` page (server component + client form) with an email field; submitting sends a password reset email via Resend
- Always show the same generic success message ("If an account exists for that email, we've sent a reset link") so the form doesn't reveal which emails are registered
- Only send the email when the user exists and has a password (GitHub-only accounts get no email, but see the same message)
- Password reset tokens stored in the existing `VerificationToken` model, with no schema change or migration: random 32-byte token, only the SHA-256 hash stored, 1 hour expiry, a new request replaces any earlier reset token for that email
- `sendPasswordResetEmail(email, resetUrl)` in `src/lib/email.ts`, matching `sendVerificationEmail`
- `/reset-password?token=...` page with new password + confirm password fields (same rules as register: min 8 chars, must match), sharing a Zod schema in `src/lib/validations/auth.ts`
- On submit: check the token, hash the new password with bcrypt, update the user, delete the token (single use), then redirect to `/sign-in` with a success message ("Password updated, you can now sign in")
- Invalid, expired or already-used tokens show a clear error with a link to request a new reset email
- Server actions in `src/actions/auth.ts` returning the `{ success, error }` pattern, with Zod-validated input
- `npm run build` passes

## Notes

- **Token separation:** `VerificationToken` has no type column, and its `identifier` is the plain email for email verification. Reset tokens use a namespaced identifier (`password-reset:<email>`) so that:
  - `createVerificationToken`'s `deleteMany({ identifier: email })` doesn't delete pending reset tokens, and the reverse
  - `consumeVerificationToken` can't verify an email with a reset token, and a verification token can't reset a password (each consume function filters on its own identifier)
- Put the reset token helpers next to the existing ones (`src/lib/verification-token.ts`, or a sibling `src/lib/password-reset-token.ts`), reusing `hashToken`
- A successful reset also sets `emailVerified` if it was null, because the user just proved they own the inbox
- Reset emails are sent whatever `EMAIL_VERIFICATION_ENABLED` is set to (that flag only controls the verification flow). With the default `onboarding@resend.dev` sender, Resend only delivers to the account owner's address until a domain is verified
- The reset URL is built from `process.env.AUTH_URL`, falling back to the request URL, the same way as the verification link in the register route
- Pages stay server components; `'use client'` only on the form components (`forgot-password-form.tsx`, `reset-password-form.tsx`) in `src/components/auth/`, reusing `AuthCard`, `FormField`, `FormMessage`
- Out of scope: rate limiting, signing out existing JWT sessions after a reset, changing the password from a profile page

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
- **2026-10-18** — Email verification toggle complete: `EMAIL_VERIFICATION_ENABLED` env flag read via `isEmailVerificationEnabled()` (`src/lib/feature-flags.ts`, opt-in: only `"true"` enables); when off, register skips the token/Resend email and credentials sign-in skips the `emailVerified` check; register API returns `verificationRequired` so the toast says "Check your inbox" or "Account created"; flag set to `false` in `.env`/`.env.production` until a Resend domain is verified
