import { z } from "zod";

export const COLLECTION_NAME_MAX_LENGTH = 100;
export const COLLECTION_DESCRIPTION_MAX_LENGTH = 500;

// Blank strings from cleared inputs are stored as null rather than "".
function blankToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

export const createCollectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(COLLECTION_NAME_MAX_LENGTH, `Name must be ${COLLECTION_NAME_MAX_LENGTH} characters or less`),
  description: z.preprocess(
    blankToNull,
    z
      .string()
      .trim()
      .max(
        COLLECTION_DESCRIPTION_MAX_LENGTH,
        `Description must be ${COLLECTION_DESCRIPTION_MAX_LENGTH} characters or less`
      )
      .nullish()
  ),
});

export type CreateCollectionInput = z.input<typeof createCollectionSchema>;
export type CreateCollectionData = z.output<typeof createCollectionSchema>;
