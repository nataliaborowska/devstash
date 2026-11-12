import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import {
  DASHBOARD_COLLECTIONS_LIMIT,
  toSkipTake,
  type PageParams,
  type PaginatedResult,
} from "@/lib/pagination"
import type {
  CreateCollectionData,
  UpdateCollectionData,
} from "@/lib/validations/collections"

export type CollectionType = {
  id: string
  name: string
  icon: string
  color: string
}

export type CollectionWithStats = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  itemCount: number
  types: CollectionType[]
  dominantColor: string | null
}

async function getCollectionsWithStats(
  where: Prisma.CollectionWhereInput,
  { skip, take }: { skip?: number; take: number }
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where,
    skip,
    take,
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      items: {
        select: {
          item: {
            select: {
              typeId: true,
              type: { select: { id: true, name: true, icon: true, color: true } },
            },
          },
        },
      },
    },
  })

  return collections.map((col) => {
    const items = col.items.map((link) => link.item)
    const countByType = new Map<string, { type: (typeof items)[0]["type"]; count: number }>()

    for (const item of items) {
      const entry = countByType.get(item.typeId)
      if (entry) {
        entry.count++
      } else {
        countByType.set(item.typeId, { type: item.type, count: 1 })
      }
    }

    const sorted = [...countByType.values()].sort((a, b) => b.count - a.count)

    const dominantColor = sorted[0]?.type.color ?? null

    const types = sorted.map(({ type }) => ({
      id: type.id,
      name: type.name,
      icon: type.icon ?? "",
      color: type.color ?? "#6b7280",
    }))

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: items.length,
      types,
      dominantColor,
    }
  })
}

export async function getRecentCollections(
  userId: string,
  limit = DASHBOARD_COLLECTIONS_LIMIT
): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ userId }, { take: limit })
}

export async function getFavoriteCollections(
  userId: string,
  limit = 10
): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ userId, isFavorite: true }, { take: limit })
}

export async function getNonFavoriteCollections(
  userId: string,
  limit = 10
): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ userId, isFavorite: false }, { take: limit })
}

// One page of the user's collections, most recently updated first, for the /collections page.
export async function getCollectionsPage(
  userId: string,
  pageParams: PageParams
): Promise<PaginatedResult<CollectionWithStats>> {
  const where = { userId }
  const [collections, total] = await Promise.all([
    getCollectionsWithStats(where, toSkipTake(pageParams)),
    prisma.collection.count({ where }),
  ])
  return { data: collections, total }
}

export type FavoriteCollection = {
  id: string
  name: string
  itemCount: number
  updatedAt: Date
}

// Every collection the user has favorited, most recently updated first, for the /favorites list.
export async function getAllFavoriteCollections(userId: string): Promise<FavoriteCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    select: { id: true, name: true, updatedAt: true, _count: { select: { items: true } } },
  })
  return collections.map(({ _count, ...collection }) => ({
    ...collection,
    itemCount: _count.items,
  }))
}

export type CollectionOption = {
  id: string
  name: string
  itemCount: number
}

// Every collection the user owns, for pickers and global search. No limit, only an item count.
export async function getCollectionOptions(userId: string): Promise<CollectionOption[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { items: true } } },
  })
  return collections.map(({ _count, ...collection }) => ({
    ...collection,
    itemCount: _count.items,
  }))
}

// True only when every id is one of the user's collections.
export async function userOwnsCollections(
  userId: string,
  collectionIds: string[]
): Promise<boolean> {
  if (collectionIds.length === 0) return true
  const count = await prisma.collection.count({ where: { id: { in: collectionIds }, userId } })
  return count === new Set(collectionIds).size
}

export type CollectionSummary = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
}

// Null when the collection doesn't exist or belongs to another user.
export async function getCollectionById(
  userId: string,
  id: string
): Promise<CollectionSummary | null> {
  return prisma.collection.findFirst({
    where: { id, userId },
    select: { id: true, name: true, description: true, isFavorite: true },
  })
}

export async function createCollection(
  userId: string,
  data: CreateCollectionData
): Promise<CollectionSummary> {
  return prisma.collection.create({
    data: { ...data, userId },
    select: { id: true, name: true, description: true, isFavorite: true },
  })
}

// Null when the collection doesn't exist or belongs to another user.
export async function updateCollection(
  userId: string,
  id: string,
  data: UpdateCollectionData
): Promise<CollectionSummary | null> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.collection.updateMany({ where: { id, userId }, data })
    if (count === 0) return null
    return tx.collection.findFirst({
      where: { id, userId },
      select: { id: true, name: true, description: true, isFavorite: true },
    })
  })
}

// Sets an explicit value so repeated clicks are idempotent. Returns false when the collection
// doesn't exist or belongs to another user.
export async function setCollectionFavorite(
  userId: string,
  id: string,
  isFavorite: boolean
): Promise<boolean> {
  const { count } = await prisma.collection.updateMany({
    where: { id, userId },
    data: { isFavorite },
  })
  return count > 0
}

// Removes only the collection; its CollectionItem links cascade, the items themselves are kept.
export async function deleteCollection(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.collection.deleteMany({ where: { id, userId } })
  return count > 0
}
