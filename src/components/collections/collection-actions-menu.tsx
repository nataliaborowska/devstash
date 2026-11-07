"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import {
  EditCollectionDialog,
  type EditableCollection,
} from "@/components/collections/edit-collection-dialog";
import { cn } from "@/lib/utils";

interface CollectionActionsMenuProps {
  collection: EditableCollection & { isFavorite: boolean };
  className?: string;
}

// The 3-dots menu on a collection card with Edit, Favorite, and Delete.
export function CollectionActionsMenu({ collection, className }: CollectionActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${collection.name}`}
          className={cn(
            "shrink-0 p-0.5 rounded hover:bg-muted transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            className
          )}
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {/* Favorite toggling isn't implemented yet. */}
          <DropdownMenuItem>
            <Star className={cn(collection.isFavorite && "fill-yellow-400 text-yellow-400")} />
            {collection.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCollectionDialog collection={collection} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteCollectionDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
