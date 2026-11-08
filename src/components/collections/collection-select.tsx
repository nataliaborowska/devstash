"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CollectionOption } from "@/lib/db/collections";

const CollectionOptionsContext = createContext<CollectionOption[]>([]);

interface CollectionOptionsProviderProps {
  collections: CollectionOption[];
  children: ReactNode;
}

// Shares the signed-in user's collections with item forms anywhere in the app shell.
export function CollectionOptionsProvider({ collections, children }: CollectionOptionsProviderProps) {
  return (
    <CollectionOptionsContext.Provider value={collections}>{children}</CollectionOptionsContext.Provider>
  );
}

export function useCollectionOptions() {
  return useContext(CollectionOptionsContext);
}

interface CollectionSelectProps {
  id?: string;
  value: string[];
  onChange: (collectionIds: string[]) => void;
  disabled?: boolean;
}

// Multi-select: an item can sit in any number of collections.
export function CollectionSelect({ id, value, onChange, disabled }: CollectionSelectProps) {
  const collections = useCollectionOptions();
  const nameById = new Map(collections.map((c) => [c.id, c.name]));

  function renderSelected(selected: string[]) {
    const names = selected.flatMap((collectionId) => nameById.get(collectionId) ?? []);
    if (names.length === 0) return <span className="text-muted-foreground">No collections</span>;
    return <span className="truncate">{names.join(", ")}</span>;
  }

  return (
    <Select
      multiple
      value={value}
      onValueChange={(next) => onChange(next ?? [])}
      disabled={disabled || collections.length === 0}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue className="min-w-0">{renderSelected}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {collections.map((collection) => (
          <SelectItem key={collection.id} value={collection.id}>
            {collection.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
