"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { updateItem } from "@/actions/items";
import { DetailSection, ItemMetaSections } from "@/components/items/item-detail-sections";
import type { ItemDetailData } from "@/components/items/item-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const URL_TYPES = ["link"];

interface ItemEditFormProps {
  item: ItemDetailData;
  onCancel: () => void;
  onSaved: (item: ItemDetailData) => void;
}

export function ItemEditForm({ item, onCancel, onSaved }: ItemEditFormProps) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tags, setTags] = useState(item.tags.join(", "));

  const typeName = item.type.name;
  const showContent = CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = URL_TYPES.includes(typeName);

  function handleSave() {
    startSaving(async () => {
      // Type-specific fields are left undefined when hidden so the server doesn't touch them.
      const result = await updateItem(item.id, {
        title,
        description,
        content: showContent ? content : undefined,
        language: showLanguage ? language : undefined,
        url: showUrl ? url : undefined,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item saved");
      onSaved({
        ...result.data,
        createdAt: result.data.createdAt.toISOString(),
        updatedAt: result.data.updatedAt.toISOString(),
        lastUsedAt: result.data.lastUsedAt?.toISOString() ?? null,
      });
      router.refresh();
    });
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center justify-end gap-2 border-y border-border px-4 py-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          <X />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving || title.trim() === ""}>
          <Check />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <DetailSection label="Title" htmlFor="item-title">
          <Input
            id="item-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={title.trim() === ""}
            required
          />
        </DetailSection>

        <DetailSection label="Description" htmlFor="item-description">
          <Textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </DetailSection>

        {showContent && (
          <DetailSection label="Content" htmlFor="item-content">
            <Textarea
              id="item-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="max-h-96 min-h-40 font-mono text-xs md:text-xs leading-relaxed"
              spellCheck={false}
            />
          </DetailSection>
        )}

        {showLanguage && (
          <DetailSection label="Language" htmlFor="item-language">
            <Input
              id="item-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. typescript"
            />
          </DetailSection>
        )}

        {showUrl && (
          <DetailSection label="URL" htmlFor="item-url">
            <Input
              id="item-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
            />
          </DetailSection>
        )}

        <DetailSection label="Tags" htmlFor="item-tags">
          <Input
            id="item-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, hooks, auth"
          />
          <p className="text-xs text-muted-foreground">Separate tags with commas</p>
        </DetailSection>

        <ItemMetaSections item={item} />
      </div>
    </>
  );
}
