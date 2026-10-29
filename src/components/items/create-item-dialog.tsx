"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createItem } from "@/actions/items";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ItemType } from "@/lib/db/items";
import { TypeIcon } from "@/lib/icon-map";
import {
  CONTENT_ITEM_TYPES,
  CREATABLE_ITEM_TYPES,
  LANGUAGE_ITEM_TYPES,
  URL_ITEM_TYPES,
  type CreatableItemType,
} from "@/lib/validations/items";

interface TypeOptionLabelProps {
  name: CreatableItemType;
  itemType: ItemType | undefined;
}

function TypeOptionLabel({ name, itemType }: TypeOptionLabelProps) {
  return (
    <span className="flex items-center gap-2 capitalize">
      <TypeIcon name={itemType?.icon} style={{ color: itemType?.color ?? undefined }} />
      {name}
    </span>
  );
}

interface CreateItemFormProps {
  itemTypes: ItemType[];
  onCreated: () => void;
}

function CreateItemForm({ itemTypes, onCreated }: CreateItemFormProps) {
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();
  const [type, setType] = useState<CreatableItemType>("snippet");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  const showContent = CONTENT_ITEM_TYPES.includes(type);
  const showLanguage = LANGUAGE_ITEM_TYPES.includes(type);
  const showUrl = URL_ITEM_TYPES.includes(type);
  const canSubmit = title.trim() !== "" && (!showUrl || url.trim() !== "");

  // The seeded types supply each option's icon and color.
  const typeByName = new Map(itemTypes.map((t) => [t.name, t]));

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    startCreating(async () => {
      const result = await createItem({
        type,
        title,
        description,
        content,
        language,
        url,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item created");
      onCreated();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DetailSection label="Type" htmlFor="new-item-type">
        <Select
          value={type}
          onValueChange={(value) => value && setType(value as CreatableItemType)}
        >
          <SelectTrigger id="new-item-type" className="w-full">
            <SelectValue>
              {(value: CreatableItemType) => (
                <TypeOptionLabel name={value} itemType={typeByName.get(value)} />
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CREATABLE_ITEM_TYPES.map((name) => (
              <SelectItem key={name} value={name}>
                <TypeOptionLabel name={name} itemType={typeByName.get(name)} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DetailSection>

      <DetailSection label="Title" htmlFor="new-item-title">
        <Input
          id="new-item-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </DetailSection>

      <DetailSection label="Description" htmlFor="new-item-description">
        <Textarea
          id="new-item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </DetailSection>

      {showContent && (
        <DetailSection label="Content" htmlFor="new-item-content">
          <Textarea
            id="new-item-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="max-h-72 min-h-32 font-mono text-xs md:text-xs leading-relaxed"
            spellCheck={false}
          />
        </DetailSection>
      )}

      {showLanguage && (
        <DetailSection label="Language" htmlFor="new-item-language">
          <Input
            id="new-item-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. typescript"
          />
        </DetailSection>
      )}

      {showUrl && (
        <DetailSection label="URL" htmlFor="new-item-url">
          <Input
            id="new-item-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            required
          />
        </DetailSection>
      )}

      <DetailSection label="Tags" htmlFor="new-item-tags">
        <Input
          id="new-item-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="react, hooks, auth"
        />
        <p className="text-xs text-muted-foreground">Separate tags with commas</p>
      </DetailSection>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" disabled={isCreating} />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isCreating || !canSubmit}>
          {isCreating ? "Creating..." : "Create item"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface CreateItemDialogProps {
  itemTypes: ItemType[];
}

export function CreateItemDialog({ itemTypes }: CreateItemDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" className="h-8 gap-1.5 text-xs" aria-label="New item" />}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">New Item</span>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>Save a snippet, prompt, command, note, or link.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open so each new item starts from an empty form. */}
        {open && <CreateItemForm itemTypes={itemTypes} onCreated={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
