---
name: devstash-recurring-patterns
description: Recurring anti-patterns and conventions found in DevStash code — check whether these persist on future audits
metadata:
  type: project
---

Observed at 2026-08-01 audit (commit 85e6782):

- **Icon-map duplication**: `src/lib/icon-map.ts` exports a shared `ICON_MAP`/`getTypeIcon()` (falls back to `HelpCircle`), but `src/components/dashboard/item-card.tsx` and `src/components/dashboard/collection-card.tsx` each redefine their own identical local `ICON_MAP` instead of importing the shared helper. Also causes inconsistent fallback behavior: sidebar/icon-map.ts falls back to `HelpCircle`, item-card.tsx falls back to `HelpCircle` (its own copy), but collection-card.tsx silently renders nothing (`if (!Icon) return null`) for unmapped icons.
- **Query layer (`src/lib/db/items.ts`, `src/lib/db/collections.ts`) has no `userId` scoping** on any read (`getPinnedItems`, `getRecentItems`, `getItemStats`, `getRecentCollections`, `getFavoriteCollections`, `getNonFavoriteCollections`, `getItemTypesWithCounts` all query across all users). Fine today (single demo user, no auth), but is a landmine: once auth ships, these must be updated to filter by session user or every user will see everyone's data. Worth checking again once auth work starts.
- **Over-fetching via `include` instead of `select`**: `getPinnedItems`/`getRecentItems` `include: { type: true, tags: {...} }` pulls every Item column (including the `content` field, which is `@db.Text` and can hold full code snippets/prompts) even though `mapItem()` only uses a handful of fields. Same pattern in `getCollectionsWithStats` (pulls full Item + full ItemType rows just to count/group client-side). Worth checking if this gets fixed or spreads to new query functions.
- **Type duplication**: components re-declare local prop interfaces (e.g. `item-card.tsx`'s local `Item`/`ItemType`) instead of importing the equivalent type already exported from `src/lib/db/items.ts` (`ItemWithType`). `collection-card.tsx` does this correctly (imports `CollectionWithStats`) — inconsistent across the two sibling card components.
- Tailwind v4 CSS config is correctly followed (no `tailwind.config.*`, uses `@theme` in `globals.css`). Dynamic per-item colors from the DB (`type.color`) are applied via inline `style={{ color, borderLeftColor }}` in several components — this is a reasonable/standard escape hatch for genuinely dynamic runtime values in Tailwind v4 (can't be expressed as static utility classes), not a real violation of the "no inline styles" rule, which is really about styling that should've been Tailwind utilities.
- `package.json` has `next: 16.2.6` and `react: 19.2.4` — CLAUDE.md/docs describe the stack as "Next.js 15". Versions have drifted ahead of the docs; not a code bug, just worth flagging so the user can decide whether to update docs or pin versions.

**Why:** These are groundwork issues that will compound as more CRUD/auth features are layered on. Good to re-check on next audit pass to see if they've been addressed or have spread to new files.
**How to apply:** When auditing new commits, grep for new usages of `include:` on Item queries and new local ICON_MAP-style duplication before flagging as "new" — check if these are the same known instances or genuinely new spread.
