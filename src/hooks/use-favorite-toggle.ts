"use client";

import { startTransition, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FavoriteSaveResult = { success: true } | { success: false; error: string };

interface UseFavoriteToggleOptions {
  isFavorite: boolean;
  save: (isFavorite: boolean) => Promise<FavoriteSaveResult>;
  // For client-held copies (e.g. the open item drawer) that router.refresh() doesn't update.
  onSaved?: (isFavorite: boolean) => void;
}

// Flips the star immediately, saves the explicit new value, and refreshes server data so every
// favorite indicator (cards, sidebar, stats, /favorites) catches up. The optimistic value falls
// back to `isFavorite` with an error toast when the save fails.
export function useFavoriteToggle({ isFavorite, save, onSaved }: UseFavoriteToggleOptions) {
  const router = useRouter();
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite);
  const [isPending, startToggleTransition] = useTransition();

  function toggle() {
    const next = !optimisticFavorite;
    startToggleTransition(async () => {
      setOptimisticFavorite(next);
      const result = await save(next);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      // Updates after an await need their own transition to stay part of this action, which
      // keeps the optimistic value on screen until the refreshed props arrive.
      startTransition(() => {
        onSaved?.(next);
        router.refresh();
      });
    });
  }

  return { isFavorite: optimisticFavorite, toggle, isPending };
}
