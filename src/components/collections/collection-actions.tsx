"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import {
  EditCollectionDialog,
  type EditableCollection,
} from "@/components/collections/edit-collection-dialog";
import { cn } from "@/lib/utils";

interface CollectionActionsProps {
  collection: EditableCollection & { isFavorite: boolean };
  className?: string;
}

// Favorite / Edit / Delete buttons for the collection detail page header.
export function CollectionActions({ collection, className }: CollectionActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Favorite toggling isn't implemented yet; the button only reflects the current state. */}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={collection.isFavorite ? "Unfavorite" : "Favorite"}
        aria-pressed={collection.isFavorite}
      >
        <Star className={cn(collection.isFavorite && "fill-yellow-400 text-yellow-400")} />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditOpen(true)}>
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 />
      </Button>

      <EditCollectionDialog collection={collection} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteCollectionDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectToCollections
      />
    </div>
  );
}
