"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { createCollection } from "@/actions/collections";
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
import { cn } from "@/lib/utils";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH,
} from "@/lib/validations/collections";

interface CreateCollectionFormProps {
  onCreated: () => void;
  onPendingChange: (isPending: boolean) => void;
}

function CreateCollectionForm({ onCreated, onPendingChange }: CreateCollectionFormProps) {
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = name.trim() !== "";

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isCreating || !canSubmit) return;

    onPendingChange(true);
    startCreating(async () => {
      const result = await createCollection({ name, description });
      onPendingChange(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Collection "${result.data.name}" created`);
      onCreated();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DetailSection label="Name" htmlFor="new-collection-name">
        <Input
          id="new-collection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={COLLECTION_NAME_MAX_LENGTH}
          placeholder="e.g. React Patterns"
          required
          autoFocus
        />
      </DetailSection>

      <DetailSection label="Description" htmlFor="new-collection-description">
        <Textarea
          id="new-collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={COLLECTION_DESCRIPTION_MAX_LENGTH}
          placeholder="Optional description"
        />
      </DetailSection>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" disabled={isCreating} />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isCreating || !canSubmit}>
          {isCreating ? "Creating..." : "Create collection"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface CreateCollectionButtonProps {
  className?: string;
}

export function CreateCollectionButton({ className }: CreateCollectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Keep the dialog open while a save is running so the result toast isn't orphaned.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return;
    setOpen(nextOpen);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("h-8 gap-1.5 text-xs", className)}
        onClick={() => setOpen(true)}
      >
        <FolderPlus className="h-3.5 w-3.5" />
        New Collection
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
            <DialogDescription>Group related items of any type together.</DialogDescription>
          </DialogHeader>
          {/* Mounted only while open so each new collection starts from an empty form. */}
          {open && (
            <CreateCollectionForm
              onCreated={() => setOpen(false)}
              onPendingChange={setIsPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
