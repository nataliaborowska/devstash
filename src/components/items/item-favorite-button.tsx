"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { Star } from "lucide-react";
import { toggleItemFavorite } from "@/actions/items";
import { useFavoriteToggle } from "@/hooks/use-favorite-toggle";
import { cn } from "@/lib/utils";

interface ItemFavoriteButtonProps {
  itemId: string;
  itemTitle: string;
  isFavorite: boolean;
}

// Star toggle on an item card. Clicks and key presses stop here so the card doesn't open the drawer.
export function ItemFavoriteButton({ itemId, itemTitle, isFavorite }: ItemFavoriteButtonProps) {
  const favorite = useFavoriteToggle({
    isFavorite,
    save: (next) => toggleItemFavorite(itemId, next),
  });

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    favorite.toggle();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    // The card trigger listens for Enter/Space; let the button handle them natively instead.
    event.stopPropagation();
  }

  return (
    <button
      type="button"
      aria-label={favorite.isFavorite ? `Unfavorite ${itemTitle}` : `Favorite ${itemTitle}`}
      aria-pressed={favorite.isFavorite}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "shrink-0 rounded p-0.5 transition-opacity hover:bg-muted outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50",
        !favorite.isFavorite && "opacity-0 group-hover:opacity-100"
      )}
    >
      <Star
        className={cn(
          "h-3 w-3",
          favorite.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
