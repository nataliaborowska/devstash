export const SEARCH_PREVIEW_LENGTH = 120

// Collapses whitespace and truncates text to a single-line preview for search results.
export function toSearchPreview(
  text: string | null | undefined,
  maxLength = SEARCH_PREVIEW_LENGTH
): string | null {
  const collapsed = text?.replace(/\s+/g, " ").trim()
  if (!collapsed) return null
  if (collapsed.length <= maxLength) return collapsed
  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`
}
