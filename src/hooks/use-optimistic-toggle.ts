"use client";

import { startTransition, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type ToggleSaveResult = { success: true } | { success: false; error: string };

export interface UseOptimisticToggleOptions {
  value: boolean;
  save: (value: boolean) => Promise<ToggleSaveResult>;
  // For client-held copies (e.g. the open item drawer) that router.refresh() doesn't update.
  onSaved?: (value: boolean) => void;
  // Optional toast shown after a successful save.
  successMessage?: (value: boolean) => string;
}

// Flips the value immediately, saves the explicit new value, and refreshes server data so every
// indicator (cards, sidebar, stats, listings) catches up. The optimistic value falls back to
// `value` with an error toast when the save fails.
export function useOptimisticToggle({
  value,
  save,
  onSaved,
  successMessage,
}: UseOptimisticToggleOptions) {
  const router = useRouter();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const [isPending, startToggleTransition] = useTransition();

  function toggle() {
    const next = !optimisticValue;
    startToggleTransition(async () => {
      setOptimisticValue(next);
      const result = await save(next);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (successMessage) toast.success(successMessage(next));
      // Updates after an await need their own transition to stay part of this action, which
      // keeps the optimistic value on screen until the refreshed props arrive.
      startTransition(() => {
        onSaved?.(next);
        router.refresh();
      });
    });
  }

  return { value: optimisticValue, toggle, isPending };
}
