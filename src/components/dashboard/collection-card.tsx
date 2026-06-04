"use client";

import Link from "next/link";
import { Star, MoreHorizontal, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon, type LucideIcon } from "lucide-react";
import type { CollectionWithStats } from "@/lib/db/collections";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

interface CollectionCardProps {
  collection: CollectionWithStats;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { name, description, isFavorite, itemCount, types, dominantColor } = collection;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:bg-accent/30 transition-colors border-l-4"
      style={{ borderLeftColor: dominantColor ?? undefined }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
          <h3 className="font-medium text-sm truncate">{name}</h3>
        </div>
        <button
          onClick={(e) => e.preventDefault()}
          className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {types.map((type) => {
            const Icon = ICON_MAP[type.icon];
            if (!Icon) return null;
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
    </Link>
  );
}
