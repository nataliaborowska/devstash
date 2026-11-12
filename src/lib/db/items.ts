import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { toSkipTake, type PageParams, type PaginatedResult } from "@/lib/pagination"
import { toSearchPreview } from "@/lib/search"
import type { CreateItemData, UpdateItemData } from "@/lib/validations/items"

export type ItemType = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export type ItemWithType = {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  lastUsedAt: Date | null
  type: ItemType
  tags: string[]
}

function mapItem(item: {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  lastUsedAt: Date | null
  type: { id: string; name: string; icon: string | null; color: string | null }
  tags: { tag: { name: string } }[]
}): ItemWithType {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    lastUsedAt: item.lastUsedAt,
    type: {
      id: item.type.id,
      name: item.type.name,
      icon: item.type.icon,
      color: item.type.color,
    },
    tags: item.tags.map((t) => t.tag.name),
  }
}

const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  lastUsedAt: true,
  type: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const

export async function getPinnedItems(limit = 10): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    take: limit,
    select: ITEM_SELECT,
    orderBy: { updatedAt: "desc" },
  })
  return items.map(mapItem)
}

export async function getRecentItems(limit = 10): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    take: limit,
    select: ITEM_SELECT,
    orderBy: [
      { lastUsedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  })
  return items.map(mapItem)
}

// URL slugs are the plural of the system type name, e.g. "snippets" -> "snippet"
export async function getSystemItemTypeBySlug(slug: string): Promise<ItemType | null> {
  if (!slug.endsWith("s")) return null
  return prisma.itemType.findFirst({
    where: { name: slug.slice(0, -1), isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  })
}

// One page of items, pinned first then most recently updated, plus the total for page links.
async function getItemsPage(
  where: Prisma.ItemWhereInput,
  pageParams: PageParams
): Promise<PaginatedResult<ItemWithType>> {
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      ...toSkipTake(pageParams),
      select: ITEM_SELECT,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }, { id: "asc" }],
    }),
    prisma.item.count({ where }),
  ])
  return { data: items.map(mapItem), total }
}

export async function getItemsByType(
  userId: string,
  typeId: string,
  pageParams: PageParams
): Promise<PaginatedResult<ItemWithType>> {
  return getItemsPage({ userId, typeId }, pageParams)
}

export async function getItemsByCollection(
  userId: string,
  collectionId: string,
  pageParams: PageParams
): Promise<PaginatedResult<ItemWithType>> {
  return getItemsPage({ userId, collections: { some: { collectionId } } }, pageParams)
}

export type FavoriteItem = {
  id: string
  title: string
  type: ItemType
  updatedAt: Date
}

// Every item the user has favorited, most recently updated first, for the /favorites list.
export async function getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
  return prisma.item.findMany({
    where: { userId, isFavorite: true },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      type: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
  })
}

export type SearchItem = {
  id: string
  title: string
  type: ItemType
  preview: string | null
}

// Every item the user owns in a lightweight shape for the client-side command palette.
// The preview comes from content, then URL, then description.
export async function getSearchItems(userId: string): Promise<SearchItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      description: true,
      type: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    preview: toSearchPreview(item.content) ?? toSearchPreview(item.url) ?? toSearchPreview(item.description),
  }))
}

export type ItemDetail = ItemWithType & {
  contentType: "TEXT" | "FILE"
  content: string | null
  url: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  language: string | null
  updatedAt: Date
  collections: { id: string; name: string }[]
}

const ITEM_DETAIL_SELECT = {
  ...ITEM_SELECT,
  contentType: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  language: true,
  updatedAt: true,
  collections: {
    select: { collection: { select: { id: true, name: true } } },
    orderBy: { collection: { name: "asc" } },
  },
} as const

function mapItemDetail(
  item: Parameters<typeof mapItem>[0] &
    Omit<ItemDetail, keyof ItemWithType | "collections"> & {
      collections: { collection: { id: string; name: string } }[]
    }
): ItemDetail {
  return {
    ...mapItem(item),
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    language: item.language,
    updatedAt: item.updatedAt,
    collections: item.collections.map((link) => link.collection),
  }
}

// Scoped to the owner so one user can never read another user's item by id.
export async function getItemDetail(userId: string, id: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: ITEM_DETAIL_SELECT,
  })
  return item ? mapItemDetail(item) : null
}

function linkCollections(collectionIds: string[]) {
  return collectionIds.map((collectionId) => ({ collectionId }))
}

function connectOrCreateTags(userId: string, tags: string[]) {
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { name_userId: { name, userId } },
        create: { name, userId },
      },
    },
  }))
}

// Returns null when the system item type doesn't exist (e.g. unseeded database).
export async function createItem(userId: string, data: CreateItemData): Promise<ItemDetail | null> {
  const { type, tags, collectionIds = [], ...fields } = data

  const itemType = await prisma.itemType.findFirst({
    where: { name: type, isSystem: true },
    select: { id: true },
  })
  if (!itemType) return null

  const item = await prisma.item.create({
    data: {
      ...fields,
      userId,
      typeId: itemType.id,
      tags: { create: connectOrCreateTags(userId, tags) },
      collections: { create: linkCollections(collectionIds) },
    },
    select: ITEM_DETAIL_SELECT,
  })
  return mapItemDetail(item)
}

// Returns null when the item doesn't exist or isn't owned by the user.
export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const { tags, collectionIds, ...fields } = data

  return prisma.$transaction(async (tx) => {
    const existing = await tx.item.findFirst({ where: { id, userId }, select: { id: true } })
    if (!existing) return null

    const item = await tx.item.update({
      where: { id },
      data: {
        ...fields,
        tags: {
          deleteMany: {},
          create: connectOrCreateTags(userId, tags),
        },
        // Omitted collectionIds leave the item's collections untouched.
        ...(collectionIds && {
          collections: { deleteMany: {}, create: linkCollections(collectionIds) },
        }),
      },
      select: ITEM_DETAIL_SELECT,
    })
    return mapItemDetail(item)
  })
}

// Returns false when the item doesn't exist or isn't owned by the user.
export async function deleteItem(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.item.deleteMany({ where: { id, userId } })
  return count > 0
}

// Sets an explicit value so repeated clicks are idempotent. Returns false when the item
// doesn't exist or isn't owned by the user.
export async function setItemFavorite(
  userId: string,
  id: string,
  isFavorite: boolean
): Promise<boolean> {
  const { count } = await prisma.item.updateMany({ where: { id, userId }, data: { isFavorite } })
  return count > 0
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems, totalCollections, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ])
  return { totalItems, favoriteItems, totalCollections, favoriteCollections }
}

export type ItemTypeWithCount = ItemType & { count: number }

const SYSTEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"]

export async function getItemTypesWithCounts(): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: { _count: { select: { items: true } } },
  })

  return types
    .map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }))
    .sort((a, b) => SYSTEM_TYPE_ORDER.indexOf(a.name) - SYSTEM_TYPE_ORDER.indexOf(b.name))
}

export type UserUsageStats = {
  totalItems: number
  totalCollections: number
  itemTypes: ItemTypeWithCount[]
}

export async function getUserUsageStats(userId: string): Promise<UserUsageStats> {
  const [totalItems, totalCollections, types] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: { _count: { select: { items: { where: { userId } } } } },
    }),
  ])

  const itemTypes = types
    .map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }))
    .sort((a, b) => SYSTEM_TYPE_ORDER.indexOf(a.name) - SYSTEM_TYPE_ORDER.indexOf(b.name))

  return { totalItems, totalCollections, itemTypes }
}
