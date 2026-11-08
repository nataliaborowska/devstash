// Client-side ranking for the command palette. Kept apart from `search.ts` because cmdk is a
// "use client" module and must not be imported by server code such as `lib/db/items.ts`.
import { defaultFilter } from "cmdk"

// Fuzzy scores below this are scattered letter matches ("t…e…s…t" across a long string), not real hits.
export const MIN_FUZZY_SCORE = 0.1

export interface SearchFields {
  // Short fields (titles, names, type names): substring or strong fuzzy matches.
  primary: string[]
  // Long fields (content previews): exact substring matches only.
  secondary?: (string | null | undefined)[]
}

// 0 means no match. Tiers: primary substring > primary fuzzy > secondary substring.
export function scoreSearchMatch(query: string, { primary, secondary = [] }: SearchFields): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1

  const fuzzy = Math.max(0, ...primary.map((field) => defaultFilter(field, q)))
  if (primary.some((field) => field.toLowerCase().includes(q))) return 2 + fuzzy
  if (fuzzy >= MIN_FUZZY_SCORE) return 1 + fuzzy
  if (secondary.some((field) => field?.toLowerCase().includes(q))) return 0.5
  return 0
}

// Keeps matching entries, best matches first; ties keep their original order.
export function rankBySearch<T>(
  entries: T[],
  query: string,
  getFields: (entry: T) => SearchFields
): T[] {
  if (!query.trim()) return entries
  return entries
    .map((entry) => ({ entry, score: scoreSearchMatch(query, getFields(entry)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry)
}
