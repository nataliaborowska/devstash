"use client";

import { useOptimisticToggle, type ToggleSaveResult } from "@/hooks/use-optimistic-toggle";

interface UseFavoriteToggleOptions {
  isFavorite: boolean;
  save: (isFavorite: boolean) => Promise<ToggleSaveResult>;
  // For client-held copies (e.g. the open item drawer) that router.refresh() doesn't update.
  onSaved?: (isFavorite: boolean) => void;
}

// Optimistic favorite star; see useOptimisticToggle for the save/revert/refresh behavior.
export function useFavoriteToggle({ isFavorite, save, onSaved }: UseFavoriteToggleOptions) {
  const { value, toggle, isPending } = useOptimisticToggle({ value: isFavorite, save, onSaved });
  return { isFavorite: value, toggle, isPending };
}
