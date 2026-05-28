"use client";

import Link from "next/link";
import { Star, MoreHorizontal } from "lucide-react";
import { mockItems, mockItemTypes } from "@/lib/mock-data";

interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
}

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const typeIds = [...new Set(
    mockItems
      .filter((i) => i.collectionId === collection.id)
      .map((i) => i.typeId)
  )];
  const types = typeIds
    .map((id) => mockItemTypes.find((t) => t.id === id))
    .filter(Boolean) as typeof mockItemTypes;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-border/80 hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
          <h3 className="font-medium text-sm truncate">{collection.name}</h3>
        </div>
        <button
          onClick={(e) => e.preventDefault()}
          className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
        {collection.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {types.map((type) => (
            <span
              key={type.id}
              className="text-xs font-mono w-5 text-center"
              style={{ color: type.color }}
              title={type.name}
            >
              {type.icon}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {collection.itemCount} items
        </span>
      </div>
    </Link>
  );
}
