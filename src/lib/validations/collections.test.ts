import { describe, expect, it } from "vitest";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH,
  collectionIdSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collections";

describe("createCollectionSchema", () => {
  it("trims the name and description", () => {
    const result = createCollectionSchema.parse({
      name: "  React Patterns  ",
      description: "  Hooks and components  ",
    });
    expect(result).toEqual({ name: "React Patterns", description: "Hooks and components" });
  });

  it("turns a blank description into null", () => {
    expect(createCollectionSchema.parse({ name: "Notes", description: "   " }).description).toBeNull();
  });

  it("allows a missing description", () => {
    expect(createCollectionSchema.parse({ name: "Notes" })).toEqual({ name: "Notes" });
  });

  it("rejects a blank name", () => {
    const result = createCollectionSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Name is required");
  });

  it("rejects a name that is too long", () => {
    const result = createCollectionSchema.safeParse({
      name: "a".repeat(COLLECTION_NAME_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      `Name must be ${COLLECTION_NAME_MAX_LENGTH} characters or less`
    );
  });

  it("accepts a name at the max length", () => {
    const name = "a".repeat(COLLECTION_NAME_MAX_LENGTH);
    expect(createCollectionSchema.parse({ name }).name).toBe(name);
  });

  it("rejects a description that is too long", () => {
    const result = createCollectionSchema.safeParse({
      name: "Notes",
      description: "a".repeat(COLLECTION_DESCRIPTION_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      `Description must be ${COLLECTION_DESCRIPTION_MAX_LENGTH} characters or less`
    );
  });
});

describe("updateCollectionSchema", () => {
  it("normalizes the same fields as creating", () => {
    expect(updateCollectionSchema.parse({ name: "  Notes ", description: "  " })).toEqual({
      name: "Notes",
      description: null,
    });
  });

  it("rejects a blank name", () => {
    expect(updateCollectionSchema.safeParse({ name: " " }).success).toBe(false);
  });
});

describe("collectionIdSchema", () => {
  it("trims a valid id", () => {
    expect(collectionIdSchema.parse(" col-1 ")).toBe("col-1");
  });

  it("rejects a blank id", () => {
    const result = collectionIdSchema.safeParse("  ");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Invalid collection id");
  });
});
