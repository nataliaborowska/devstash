"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCollection } from "@/actions/collections";
import { DetailSection } from "@/components/items/item-detail-sections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH,
} from "@/lib/validations/collections";

export interface EditableCollection {
  id: string;
  name: string;
  description: string | null;
}

interface EditCollectionFormProps {
  collection: EditableCollection;
  onSaved: () => void;
  onPendingChange: (isPending: boolean) => void;
}

function EditCollectionForm({ collection, onSaved, onPendingChange }: EditCollectionFormProps) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");

  const canSubmit = name.trim() !== "";

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving || !canSubmit) return;

    onPendingChange(true);
    startSaving(async () => {
      const result = await updateCollection(collection.id, { name, description });
      onPendingChange(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Collection updated");
      onSaved();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DetailSection label="Name" htmlFor="edit-collection-name">
        <Input
          id="edit-collection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={COLLECTION_NAME_MAX_LENGTH}
          required
          autoFocus
        />
      </DetailSection>

      <DetailSection label="Description" htmlFor="edit-collection-description">
        <Textarea
          id="edit-collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={COLLECTION_DESCRIPTION_MAX_LENGTH}
          placeholder="Optional description"
        />
      </DetailSection>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" disabled={isSaving} />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isSaving || !canSubmit}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EditCollectionDialogProps {
  collection: EditableCollection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionDialog({ collection, open, onOpenChange }: EditCollectionDialogProps) {
  const [isPending, setIsPending] = useState(false);

  // Keep the dialog open while a save is running so the result toast isn't orphaned.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>Update the collection&apos;s name and description.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open so the form always starts from the saved values. */}
        {open && (
          <EditCollectionForm
            collection={collection}
            onSaved={() => onOpenChange(false)}
            onPendingChange={setIsPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
