"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteItem } from "@/actions/items";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Solid red with white text: the default destructive variant's red-on-dark-red is about 3:1 contrast.
const SOLID_DESTRUCTIVE =
  "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500/40";

interface DeleteItemDialogProps {
  itemId: string;
  itemTitle: string;
  onDeleted: () => void;
}

export function DeleteItemDialog({ itemId, itemTitle, onDeleted }: DeleteItemDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteItem(itemId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item deleted");
      setOpen(false);
      onDeleted();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-11 text-destructive hover:text-destructive sm:size-7"
          />
        }
      >
        <Trash2 />
        <span className="sr-only">Delete</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes <span className="font-medium text-foreground">{itemTitle}</span>. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" className={SOLID_DESTRUCTIVE} onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
