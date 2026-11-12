"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Copy, Pencil, Pin, Star, Tag } from "lucide-react";
import { toast } from "sonner";
import { toggleItemFavorite, toggleItemPin } from "@/actions/items";
import { DeleteItemDialog } from "@/components/items/delete-item-dialog";
import { DetailSection, ItemMetaSections } from "@/components/items/item-detail-sections";
import { ItemEditForm } from "@/components/items/item-edit-form";
import { CodeEditor } from "@/components/shared/code-editor";
import { MarkdownEditor } from "@/components/shared/markdown-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFavoriteToggle } from "@/hooks/use-favorite-toggle";
import { useOptimisticToggle } from "@/hooks/use-optimistic-toggle";
import { CODE_ITEM_TYPES, getFallbackCodeLanguage } from "@/lib/code-language";
import { TypeIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import type { ItemDetail } from "@/lib/db/items";

// Dates arrive as ISO strings once the item has been serialized by the API route.
export type ItemDetailData = Omit<ItemDetail, "createdAt" | "updatedAt" | "lastUsedAt"> & {
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
};

// The provider's state setter: accepts a full item or an updater function.
type ItemUpdater = Dispatch<SetStateAction<ItemDetailData | null>>;

interface ItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDetailData | null;
  error: string | null;
  onItemUpdated: ItemUpdater;
  onItemDeleted: () => void;
}

export function ItemDrawer({ open, onOpenChange, item, error, onItemUpdated, onItemDeleted }: ItemDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        {item ? (
          // Keyed by id so edit mode resets when a different item is opened.
          <ItemDetailView
            key={item.id}
            item={item}
            onItemUpdated={onItemUpdated}
            onItemDeleted={onItemDeleted}
          />
        ) : error ? (
          <SheetHeader className="pr-12">
            <SheetTitle>Couldn&apos;t load item</SheetTitle>
            <p className="text-sm text-muted-foreground">{error}</p>
          </SheetHeader>
        ) : (
          <ItemDetailSkeleton />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface ItemDetailViewProps {
  item: ItemDetailData;
  onItemUpdated: ItemUpdater;
  onItemDeleted: () => void;
}

function ItemDetailView({ item, onItemUpdated, onItemDeleted }: ItemDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Merges into the latest drawer item, so back-to-back favorite and pin saves don't overwrite
  // each other with a stale copy.
  function onItemPatched(patch: Partial<Pick<ItemDetailData, "isFavorite" | "isPinned">>) {
    onItemUpdated((current) => (current ? { ...current, ...patch } : current));
  }
  const copyText = item.content ?? item.url;

  async function handleCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <>
      {/* Header */}
      <SheetHeader className="flex-row items-start gap-3 p-5 pr-12">
        <div className="shrink-0 h-11 w-11 rounded-md flex items-center justify-center bg-muted">
          <TypeIcon
            name={item.type.icon}
            className="h-5 w-5"
            style={{ color: item.type.color ?? undefined }}
          />
        </div>
        <div className="min-w-0 space-y-2">
          <SheetTitle className="text-lg font-semibold break-words">{item.title}</SheetTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {item.type.name}s
            </Badge>
            {item.language && <Badge variant="outline">{item.language}</Badge>}
          </div>
        </div>
      </SheetHeader>

      {isEditing ? (
        <ItemEditForm
          item={item}
          onCancel={() => setIsEditing(false)}
          onSaved={(updated) => {
            onItemUpdated(updated);
            setIsEditing(false);
          }}
        />
      ) : (
        <ItemDetailBody
          item={item}
          copyText={copyText}
          onCopy={handleCopy}
          onEdit={() => setIsEditing(true)}
          onDeleted={onItemDeleted}
          onFavoriteSaved={(isFavorite) => onItemPatched({ isFavorite })}
          onPinSaved={(isPinned) => onItemPatched({ isPinned })}
        />
      )}
    </>
  );
}

interface ItemDetailBodyProps {
  item: ItemDetailData;
  copyText: string | null;
  onCopy: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onFavoriteSaved: (isFavorite: boolean) => void;
  onPinSaved: (isPinned: boolean) => void;
}

function ItemDetailBody({
  item,
  copyText,
  onCopy,
  onEdit,
  onDeleted,
  onFavoriteSaved,
  onPinSaved,
}: ItemDetailBodyProps) {
  const favorite = useFavoriteToggle({
    isFavorite: item.isFavorite,
    save: (isFavorite) => toggleItemFavorite(item.id, isFavorite),
    onSaved: onFavoriteSaved,
  });
  const pin = useOptimisticToggle({
    value: item.isPinned,
    save: (isPinned) => toggleItemPin(item.id, isPinned),
    onSaved: onPinSaved,
    successMessage: (isPinned) => (isPinned ? "Item pinned" : "Item unpinned"),
  });

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center gap-1 border-y border-border px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={favorite.isFavorite}
          onClick={favorite.toggle}
          className={cn(favorite.isFavorite && "text-yellow-400 hover:text-yellow-400")}
        >
          <Star className={cn(favorite.isFavorite && "fill-yellow-400")} />
          Favorite
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={pin.value}
          onClick={pin.toggle}
          className={cn(pin.value && "text-violet-400 hover:text-violet-400")}
        >
          <Pin className={cn(pin.value && "fill-violet-400")} />
          Pin
        </Button>
        <Button variant="ghost" size="sm" onClick={onCopy} disabled={!copyText}>
          <Copy />
          Copy
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onEdit}>
          <Pencil />
          Edit
        </Button>
        <DeleteItemDialog itemId={item.id} itemTitle={item.title} onDeleted={onDeleted} />
      </div>

      {/* Body */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-5 space-y-6">
        {item.description && (
          <DetailSection label="Description">
            <p className="text-sm">{item.description}</p>
          </DetailSection>
        )}

        {item.content && (
          <DetailSection label="Content">
            {CODE_ITEM_TYPES.includes(item.type.name) ? (
              <CodeEditor
                value={item.content}
                language={item.language}
                fallbackLanguage={getFallbackCodeLanguage(item.type.name)}
                ariaLabel={`${item.title} content`}
                readOnly
              />
            ) : (
              <MarkdownEditor
                value={item.content}
                ariaLabel={`${item.title} content`}
                readOnly
              />
            )}
          </DetailSection>
        )}

        {item.url && (
          <DetailSection label="URL">
            {isHttpUrl(item.url) ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline break-all"
              >
                {item.url}
              </a>
            ) : (
              <p className="text-sm break-all">{item.url}</p>
            )}
          </DetailSection>
        )}

        {item.fileName && (
          <DetailSection label="File">
            <p className="text-sm">
              {item.fileName}
              {item.fileSize !== null && (
                <span className="text-muted-foreground"> · {formatFileSize(item.fileSize)}</span>
              )}
            </p>
          </DetailSection>
        )}

        <DetailSection icon={Tag} label="Tags">
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded bg-muted px-2 py-0.5 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags</p>
          )}
        </DetailSection>

        <ItemMetaSections item={item} />
      </div>
    </>
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <SheetTitle className="sr-only">Loading item</SheetTitle>
      <div className="flex items-start gap-3 p-5 pr-12">
        <div className="h-11 w-11 rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-2 border-y border-border px-4 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-20 rounded bg-muted" />
        ))}
      </div>
      <div className="p-5 space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-5 w-40 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
