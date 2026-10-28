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

export const itemIdSchema = z.string().trim().min(1, "Invalid item id");

export type UpdateItemInput = z.input<typeof updateItemSchema>;
export type UpdateItemData = z.output<typeof updateItemSchema>;
