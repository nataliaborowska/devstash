import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import type { CreateCollectionData } from "@/lib/validations/collections"

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
  limit: number
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where,
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      items: {
        select: {
          typeId: true,
          type: { select: { id: true, name: true, icon: true, color: true } },
        },
      },
    },
  })

  return collections.map((col) => {
    const countByType = new Map<string, { type: (typeof col.items)[0]["type"]; count: number }>()

    for (const item of col.items) {
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
      itemCount: col.items.length,
      types,
      dominantColor,
    }
  })
}

export async function getRecentCollections(
  userId: string,
  limit = 4
): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ userId }, limit)
}

export async function getFavoriteCollections(
  userId: string,
  limit = 10
): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ userId, isFavorite: true }, limit)
}

export async function getNonFavoriteCollections(
  userId: string,
  limit = 10
): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ userId, isFavorite: false }, limit)
}

export type CollectionSummary = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
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
