# Homepage

## Overview

Replace the placeholder `src/app/page.tsx` with the real marketing homepage, ported from the prototype in `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`). Same sections, copy, and animations, rebuilt with Tailwind CSS v4 + shadcn/ui and split into server and client components.

## Requirements

- `/` renders the homepage (public, not added to the proxy's protected routes)
- Sections in order: navbar, hero (text + chaos → arrow → dashboard visual), features, AI, pricing, CTA, footer
- Keep the prototype's copy, layout, and behavior:
  - Navbar fixed at the top, becomes more opaque after scrolling past ~20px
  - Chaos panel: 8 floating icons that drift, bounce off walls, slowly rotate and scale-pulse, and repel from the cursor (`requestAnimationFrame`)
  - Pulsing arrow between the panels, rotated 90° to point down on mobile
  - Dashboard mockup: sidebar nav + grid of item cards with type-colored top borders
  - AI section: "Pro Feature" badge, checklist, code editor mockup whose "AI Generated Tags" pop in one by one when scrolled into view
  - Pricing: Free vs Pro cards, Pro highlighted with "Most Popular", Monthly/Yearly toggle ($8/month ↔ $72/year, "Save 25%")
  - Sections fade in as they scroll into view
  - Footer copyright shows the current year
  - Respect `prefers-reduced-motion` (no drifting icons, reveals shown immediately, tags shown at once)
- Responsive: hero visual stacks vertically on mobile, grids collapse to a single column, nav links hidden on small screens

## Components

Server components by default; `"use client"` only where there is browser interactivity.

`src/app/page.tsx` (server) composes the sections and sets page `metadata` (title + description from the prototype). Components live in `src/components/homepage/`:

| Component | Type | Notes |
|---|---|---|
| `homepage-nav.tsx` | client | Scroll listener for opacity; takes `isSignedIn` |
| `hero-section.tsx` | server | Headline, subheadline, CTAs, hero visual layout |
| `chaos-icons.tsx` | client | Floating icon animation |
| `dashboard-mockup.tsx` | server | Static mock sidebar + cards |
| `features-section.tsx` | server | Renders cards from a `FEATURES` array |
| `ai-section.tsx` | server | Copy + checklist + editor mockup |
| `ai-tags.tsx` | client | Staggered tag reveal on intersection |
| `pricing-section.tsx` | server | Section head + Free card; wraps the client toggle |
| `pricing-cards.tsx` | client | Billing toggle state + Pro price |
| `cta-section.tsx` | server | |
| `homepage-footer.tsx` | server | Year via `new Date().getFullYear()` on the server |
| `reveal.tsx` | client | Wrapper that fades children in on intersection (one shared `IntersectionObserver` hook) |
| `logo.tsx` | server | Shared logo used by nav and footer |

Keep client components as small leaves so sections stay server-rendered.

## Data & Constants

Keep repeated content as typed arrays, rendered with `.map()`, not duplicated markup:

- `src/lib/homepage.ts`: `FEATURES`, `CHAOS_ICONS`, `MOCK_ITEMS`, `AI_CAPABILITIES`, `AI_TAGS`, `PRICING_PLANS` (Free/Pro features, monthly/yearly prices and notes), `FOOTER_LINKS`
- Pure chaos physics (`stepIcon` for repel, speed clamp, friction, wall bounce, rotation) in `src/lib/chaos-physics.ts` so the client component only handles DOM/RAF/events
- Pricing must match the project overview (Free: 50 items, 3 collections; Pro: $8/mo or $72/yr)

## Styling

- Tailwind CSS v4 utilities + shadcn `Button`, `Badge`; no CSS modules, no inline styles except per-icon `transform` in the animation loop
- Use the app's existing dark theme tokens (`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`, violet primary like the top bar logo)
- Item type colors: use the same colors as the seeded system item types (snippet `#3b82f6`, prompt `#8b5cf6`, command `#f97316`, note `#fde047`, file `#6b7280`, image `#ec4899`, link `#10b981`) so the homepage matches the app, instead of the prototype palette
- Icons from `lucide-react` (e.g. `Code`, `Sparkles`, `Terminal`, `StickyNote`, `File`, `Folder`, `Search`, `Bookmark`, `Github`); reuse `TypeIcon` from `src/lib/icon-map.tsx` where a type icon is needed
- Keyframes (arrow pulse, reveal fade, tag pop) added to `src/app/globals.css` via `@theme` / `@keyframes`
- Gradient headline text via Tailwind (`bg-gradient-to-r ... bg-clip-text text-transparent`)

## Links & Buttons

`page.tsx` calls `auth()` and passes `isSignedIn` down so CTAs adapt:

| Element | Signed out | Signed in |
|---|---|---|
| Nav "Features" / "Pricing" | `#features` / `#pricing` (smooth scroll) | same |
| Nav "Sign In" | `/sign-in` | hidden |
| Nav "Get Started" | `/register` | "Dashboard" → `/dashboard` |
| Hero "Get Started Free" | `/register` | "Go to Dashboard" → `/dashboard` |
| Hero "See Features" | `#features` | same |
| Free card "Get Started" | `/register` | `/dashboard` |
| Pro card "Upgrade to Pro" | `/register` | `/settings` (Stripe not built yet) |
| CTA "Get Started Free" | `/register` | `/dashboard` |
| Logo | `/` | `/` |
| Footer | Product: Features, Pricing; Account: Sign In (`/sign-in`), Register (`/register`) | Account: Dashboard, Settings |

- Use `next/link` for all internal links; render anchors as `Button` with `asChild`
- Drop the prototype's placeholder footer links (Changelog, Docs, Blog, Support, About, Privacy, Terms) since those pages don't exist
- Add `scroll-behavior: smooth` and `scroll-margin-top` on sections so anchors aren't hidden under the fixed nav

## Testing

- Unit tests for `src/lib/chaos-physics.ts` (repel inside radius only, speed clamp, wall bounce keeps icon in bounds, rotation reverses at limit) and `PRICING_PLANS` matching the overview's prices/limits
- No component tests
- Verify in the browser: animations, reduced motion, billing toggle, all links signed in and signed out, mobile layout; then `npm run lint` and `npm run build`

## Notes

- `prototypes/homepage/` stays as the reference; don't delete it
- No new dependencies
- Brand-like chaos icons (Notion, Slack, VS Code) are illustrative; use lucide icons or small inline SVGs from the prototype where lucide has no match
