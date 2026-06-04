"use client";

import {
  Star,
  Pin,
  MoreHorizontal,
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

interface ItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string | Date;
  lastUsedAt: string | Date | null;
  type: ItemType;
  tags: string[];
}

interface ItemCardProps {
  item: Item;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ItemCard({ item }: ItemCardProps) {
  const Icon = ICON_MAP[item.type.icon ?? ""] ?? HelpCircle;
  const date = item.lastUsedAt ?? item.createdAt;

  return (
    <div
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-accent/30 transition-colors cursor-pointer"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: item.type.color ?? undefined,
      }}
    >
      {/* Type icon badge */}
      <div
        className="shrink-0 h-9 w-9 rounded-md flex items-center justify-center bg-muted mt-0.5"
        title={item.type.name}
      >
        <Icon className="h-4 w-4" style={{ color: item.type.color ?? undefined }} />
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
