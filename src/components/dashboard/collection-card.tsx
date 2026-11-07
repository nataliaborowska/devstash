"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { CollectionActionsMenu } from "@/components/collections/collection-actions-menu";
import { getTypeIcon } from "@/lib/icon-map";
import type { CollectionWithStats } from "@/lib/db/collections";

interface CollectionCardProps {
  collection: CollectionWithStats;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { name, description, isFavorite, itemCount, types, dominantColor } = collection;

  return (
    <div
      className="group relative rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:bg-accent/30 transition-colors border-l-4"
      style={{ borderLeftColor: dominantColor ?? undefined }}
    >
      {/*
        The link covers the whole card but is a sibling of the actions menu, not its parent,
        so clicks in the menu and its dialogs (portaled, but still React children) never navigate.
      */}
      <Link
        href={`/collections/${collection.id}`}
        aria-label={name}
        className="absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
          <h3 className="font-medium text-sm truncate">{name}</h3>
        </div>
        <CollectionActionsMenu
          collection={collection}
          className="relative z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
        />
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {types.map((type) => {
            const Icon = getTypeIcon(type.icon);
            return (
              <span key={type.id} title={type.name}>
                <Icon className="h-3.5 w-3.5" style={{ color: type.color }} />
              </span>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
    </div>
  );
}
