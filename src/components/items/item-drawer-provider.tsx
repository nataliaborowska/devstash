"use client";

import { createContext, useContext, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ItemDrawer, type ItemDetailData } from "@/components/items/item-drawer";

type ItemDetailResponse =
  | { success: true; data: ItemDetailData }
  | { success: false; error: string };

interface ItemDrawerContextValue {
  openItem: (id: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

function useItemDrawer() {
  const context = useContext(ItemDrawerContext);
  if (!context) throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  return context;
}

// Owns the drawer state so server-rendered item cards can open it without page navigation.
export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ItemDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  async function openItem(id: string) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setItem(null);
    setError(null);
    setOpen(true);

    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, { signal: controller.signal });
      const body = (await res.json()) as ItemDetailResponse;
      if (body.success) setItem(body.data);
      else setError(body.error);
    } catch {
      if (!controller.signal.aborted) setError("Failed to load item");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) requestRef.current?.abort();
  }

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <ItemDrawer open={open} onOpenChange={handleOpenChange} item={item} error={error} />
    </ItemDrawerContext.Provider>
  );
}

interface ItemDrawerTriggerProps {
  itemId: string;
  children: ReactNode;
}

export function ItemDrawerTrigger({ itemId, children }: ItemDrawerTriggerProps) {
  const { openItem } = useItemDrawer();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItem(itemId);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(itemId)}
      onKeyDown={handleKeyDown}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </div>
  );
}
