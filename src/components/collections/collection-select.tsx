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

// Base UI's Select needs a real value for the "no collection" option.
const NO_COLLECTION = "none";

interface CollectionSelectProps {
  id?: string;
  value: string | null;
  onChange: (collectionId: string | null) => void;
  disabled?: boolean;
}

export function CollectionSelect({ id, value, onChange, disabled }: CollectionSelectProps) {
  const collections = useContext(CollectionOptionsContext);
  const nameById = new Map(collections.map((c) => [c.id, c.name]));

  return (
    <Select
      value={value ?? NO_COLLECTION}
      onValueChange={(next) => next && onChange(next === NO_COLLECTION ? null : next)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {(selected: string) => nameById.get(selected) ?? "No collection"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_COLLECTION}>No collection</SelectItem>
        {collections.map((collection) => (
          <SelectItem key={collection.id} value={collection.id}>
            {collection.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
