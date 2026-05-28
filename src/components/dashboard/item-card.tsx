"use client";

import { Star, Pin, MoreHorizontal } from "lucide-react";
import { mockItemTypes } from "@/lib/mock-data";

interface Item {
  id: string;
  title: string;
  description: string | null;
  typeId: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

interface ItemCardProps {
  item: Item;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ItemCard({ item }: ItemCardProps) {
  const type = mockItemTypes.find((t) => t.id === item.typeId);
  const date = item.lastUsedAt ?? item.createdAt;

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-accent/30 transition-colors cursor-pointer">
      {/* Type icon badge */}
      <div
        className="shrink-0 h-9 w-9 rounded-md flex items-center justify-center text-sm font-mono bg-muted mt-0.5"
        style={{ color: type?.color }}
        title={type?.name}
      >
        {type?.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-medium text-sm truncate">{item.title}</h3>
          {item.isFavorite && (
            <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
          {item.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-violet-400 fill-violet-400" />
          )}
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground truncate mb-2">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
        <button className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {formatDate(date)}
        </span>
      </div>
    </div>
  );
}
