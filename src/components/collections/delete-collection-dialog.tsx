"use client";

import { useState } from "react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCollection } from "@/actions/collections";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const SUCCESS_MESSAGE = "Collection deleted";
const FAILURE_MESSAGE = "Could not delete the collection. Please try again.";

// When the server action redirects, Next.js performs the navigation itself and rejects the
// action's promise with its internal redirect error. That rejection means the delete succeeded.
function isNextNavigation(error: unknown): boolean {
  try {
    unstable_rethrow(error);
    return false;
  } catch {
    return true;
  }
}

interface DeleteCollectionDialogProps {
  collectionId: string;
  collectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Set on the collection's own page: the server deletes it and redirects to /collections.
  redirectToCollections?: boolean;
}

export function DeleteCollectionDialog({
  collectionId,
  collectionName,
  open,
  onOpenChange,
  redirectToCollections = false,
}: DeleteCollectionDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    try {
      const result = await deleteCollection(collectionId, { redirectToCollections });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onOpenChange(false);
      toast.success(SUCCESS_MESSAGE);
      router.refresh();
    } catch (error) {
      if (isNextNavigation(error)) {
        toast.success(SUCCESS_MESSAGE);
      } else {
        console.error(error);
        toast.error(FAILURE_MESSAGE);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete collection?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes{" "}
            <span className="font-medium text-foreground">{collectionName}</span>. Its items are
            kept and stay in any other collections.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
