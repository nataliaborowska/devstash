import { prisma } from "@/lib/prisma"

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

export async function getRecentCollections(limit = 4): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: { type: true },
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
