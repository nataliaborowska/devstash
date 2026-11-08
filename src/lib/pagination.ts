export const ITEMS_PER_PAGE = 21
export const COLLECTIONS_PER_PAGE = 21
export const DASHBOARD_COLLECTIONS_LIMIT = 6
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10

export type PageParams = {
  page: number
  perPage: number
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
}

export type PageLink = number | "ellipsis"

// Reads a `?page=` search param; anything that isn't a positive integer falls back to page 1.
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || !/^\d+$/.test(raw)) return 1
  const page = Number(raw)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

// An empty list still has one page so the page that shows it stays valid.
export function getTotalPages(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage))
}

export function toSkipTake({ page, perPage }: PageParams): { skip: number; take: number } {
  return { skip: (page - 1) * perPage, take: perPage }
}

// Page 1 links to the bare path so there is a single canonical URL for the first page.
export function getPageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`
}

// First, last, and the pages around the current one, with ellipses for the gaps.
// A gap of exactly one page shows that page instead of an ellipsis.
export function getPageLinks(currentPage: number, totalPages: number, siblings = 1): PageLink[] {
  const start = Math.max(2, currentPage - siblings)
  const end = Math.min(totalPages - 1, currentPage + siblings)
  const links: PageLink[] = [1]

  if (start > 3) links.push("ellipsis")
  else if (start === 3) links.push(2)

  for (let page = start; page <= end; page++) links.push(page)

  if (end < totalPages - 2) links.push("ellipsis")
  else if (end === totalPages - 2) links.push(totalPages - 1)

  if (totalPages > 1) links.push(totalPages)
  return links
}
