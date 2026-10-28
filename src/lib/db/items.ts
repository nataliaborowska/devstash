import { prisma } from "@/lib/prisma"
import type { UpdateItemData } from "@/lib/validations/items"

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

export async function getItemsByType(userId: string, typeId: string): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    where: { userId, typeId },
    select: ITEM_SELECT,
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  })
  return items.map(mapItem)
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
  collection: { id: string; name: string } | null
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
  collection: { select: { id: true, name: true } },
} as const

function mapItemDetail(
  item: Parameters<typeof mapItem>[0] & Omit<ItemDetail, keyof ItemWithType>
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
    collection: item.collection,
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

// Returns null when the item doesn't exist or isn't owned by the user.
export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const { tags, ...fields } = data

  return prisma.$transaction(async (tx) => {
    const existing = await tx.item.findFirst({ where: { id, userId }, select: { id: true } })
    if (!existing) return null

    const item = await tx.item.update({
      where: { id },
      data: {
        ...fields,
        tags: {
          deleteMany: {},
          create: tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name_userId: { name, userId } },
                create: { name, userId },
              },
            },
          })),
        },
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

export async function getItemStats() {
  const [totalItems, favoriteItems, totalCollections, favoriteCollections] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { isFavorite: true } }),
    prisma.collection.count(),
    prisma.collection.count({ where: { isFavorite: true } }),
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
