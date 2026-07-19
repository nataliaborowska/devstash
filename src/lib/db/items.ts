import { prisma } from "@/lib/prisma"

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

export async function getPinnedItems(): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
  return items.map(mapItem)
}

export async function getRecentItems(limit = 10): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    take: limit,
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
    orderBy: [
      { lastUsedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  })
  return items.map(mapItem)
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
