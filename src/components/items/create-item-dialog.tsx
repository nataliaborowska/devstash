"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createItem } from "@/actions/items";
import { DetailSection } from "@/components/items/item-detail-sections";
import { CodeEditor } from "@/components/shared/code-editor";
import { MarkdownEditor } from "@/components/shared/markdown-editor";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CODE_ITEM_TYPES, getFallbackCodeLanguage } from "@/lib/code-language";
import type { ItemType } from "@/lib/db/items";
import { TypeIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
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
  initialType: CreatableItemType;
  onCreated: () => void;
}

function CreateItemForm({ itemTypes, initialType, onCreated }: CreateItemFormProps) {
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  const showContent = CONTENT_ITEM_TYPES.includes(type);
  const showLanguage = LANGUAGE_ITEM_TYPES.includes(type);
  const showUrl = URL_ITEM_TYPES.includes(type);
  const isCode = CODE_ITEM_TYPES.includes(type);
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
        <DetailSection label="Content" htmlFor={isCode ? undefined : "new-item-content"}>
          {isCode ? (
            <CodeEditor
              value={content}
              onChange={setContent}
              language={language}
              fallbackLanguage={getFallbackCodeLanguage(type)}
              ariaLabel="Content"
            />
          ) : (
            <MarkdownEditor id="new-item-content" value={content} onChange={setContent} />
          )}
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

interface CreateItemContextValue {
  openCreateItem: (type?: CreatableItemType) => void;
}

const CreateItemContext = createContext<CreateItemContextValue | null>(null);

function useCreateItem() {
  const context = useContext(CreateItemContext);
  if (!context) throw new Error("useCreateItem must be used within CreateItemDialogProvider");
  return context;
}

interface CreateItemDialogProviderProps {
  itemTypes: ItemType[];
  children: ReactNode;
}

// Owns the single New Item dialog so the top bar and type pages can open it with a preselected type.
export function CreateItemDialogProvider({ itemTypes, children }: CreateItemDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<CreatableItemType>("snippet");

  function openCreateItem(type: CreatableItemType = "snippet") {
    setInitialType(type);
    setOpen(true);
  }

  return (
    <CreateItemContext.Provider value={{ openCreateItem }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="scrollbar-thin max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New item</DialogTitle>
            <DialogDescription>Save a snippet, prompt, command, note, or link.</DialogDescription>
          </DialogHeader>
          {/* Mounted only while open so each new item starts from an empty form. */}
          {open && (
            <CreateItemForm
              itemTypes={itemTypes}
              initialType={initialType}
              onCreated={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </CreateItemContext.Provider>
  );
}

interface CreateItemButtonProps {
  type?: CreatableItemType;
  label?: string;
  className?: string;
}

export function CreateItemButton({ type, label = "New Item", className }: CreateItemButtonProps) {
  const { openCreateItem } = useCreateItem();

  return (
    <Button
      size="sm"
      className={cn("h-8 gap-1.5 text-xs", className)}
      onClick={() => openCreateItem(type)}
      aria-label={label}
    >
      <Plus className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
