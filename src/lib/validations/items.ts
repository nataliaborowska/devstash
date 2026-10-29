import { z } from "zod";

// Blank strings from cleared inputs are stored as null rather than "".
function blankToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

const optionalText = z.preprocess(blankToNull, z.string().trim().nullish());

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optionalText,
  // Content keeps its whitespace: indentation matters for snippets and commands.
  content: z.preprocess(blankToNull, z.string().nullish()),
  url: z.preprocess(
    blankToNull,
    z.url({ protocol: /^https?$/, message: "URL must be a valid http(s) link" }).nullish()
  ),
  language: optionalText,
  tags: z
    .array(z.string().trim().min(1, "Tags cannot be empty"))
    .transform((tags) => [...new Set(tags)]),
});

// File and image items need uploads, so they can't be created from the form yet.
export const CREATABLE_ITEM_TYPES = ["snippet", "prompt", "command", "note", "link"] as const;
export type CreatableItemType = (typeof CREATABLE_ITEM_TYPES)[number];

export const CONTENT_ITEM_TYPES: readonly string[] = ["snippet", "prompt", "command", "note"];
export const LANGUAGE_ITEM_TYPES: readonly string[] = ["snippet", "command"];
export const URL_ITEM_TYPES: readonly string[] = ["link"];

export const createItemSchema = updateItemSchema
  .extend({ type: z.enum(CREATABLE_ITEM_TYPES, "Choose an item type") })
  .refine((item) => !URL_ITEM_TYPES.includes(item.type) || item.url, {
    message: "URL is required",
    path: ["url"],
  })
  // Drop fields the selected type doesn't use so stale form values are never stored.
  .transform(({ type, content, language, url, ...rest }) => ({
    ...rest,
    type,
    content: CONTENT_ITEM_TYPES.includes(type) ? (content ?? null) : null,
    language: LANGUAGE_ITEM_TYPES.includes(type) ? (language ?? null) : null,
    url: URL_ITEM_TYPES.includes(type) ? (url ?? null) : null,
  }));

export const itemIdSchema = z.string().trim().min(1, "Invalid item id");

export type UpdateItemInput = z.input<typeof updateItemSchema>;
export type UpdateItemData = z.output<typeof updateItemSchema>;
export type CreateItemInput = z.input<typeof createItemSchema>;
export type CreateItemData = z.output<typeof createItemSchema>;
