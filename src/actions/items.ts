"use server";

import { auth } from "@/auth";
import { userOwnsCollections } from "@/lib/db/collections";
import {
  createItem as createItemInDb,
  deleteItem as deleteItemInDb,
  setItemFavorite,
  updateItem as updateItemInDb,
  type ItemDetail,
} from "@/lib/db/items";
import {
  createItemSchema,
  isFavoriteSchema,
  itemIdSchema,
  updateItemSchema,
  type CreateItemInput,
  type UpdateItemInput,
} from "@/lib/validations/items";

export type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export type DeleteItemResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export type ToggleItemFavoriteResult =
  | { success: true; data: { id: string; isFavorite: boolean } }
  | { success: false; error: string };

const COLLECTION_NOT_FOUND = "Collection not found";

// Items may only be placed in the signed-in user's own collections.
async function canUseCollections(userId: string, collectionIds: string[] | undefined) {
  return !collectionIds || userOwnsCollections(userId, collectionIds);
}

export async function createItem(data: CreateItemInput): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    if (!(await canUseCollections(session.user.id, parsed.data.collectionIds))) {
      return { success: false, error: COLLECTION_NOT_FOUND };
    }
    const item = await createItemInDb(session.user.id, parsed.data);
    if (!item) return { success: false, error: "Item type not found" };
    return { success: true, data: item };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not create the item. Please try again." };
  }
}

export async function updateItem(itemId: string, data: UpdateItemInput): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    if (!(await canUseCollections(session.user.id, parsed.data.collectionIds))) {
      return { success: false, error: COLLECTION_NOT_FOUND };
    }
    const item = await updateItemInDb(session.user.id, itemId, parsed.data);
    if (!item) return { success: false, error: "Item not found" };
    return { success: true, data: item };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the item. Please try again." };
  }
}

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = itemIdSchema.safeParse(itemId);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid item id" };
  }

  try {
    const deleted = await deleteItemInDb(session.user.id, parsed.data);
    if (!deleted) return { success: false, error: "Item not found" };
    return { success: true, data: { id: parsed.data } };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not delete the item. Please try again." };
  }
}

// Takes the desired value rather than flipping server-side, so rapid repeat clicks are idempotent.
export async function toggleItemFavorite(
  itemId: string,
  isFavorite: boolean
): Promise<ToggleItemFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsedId = itemIdSchema.safeParse(itemId);
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? "Invalid item id" };
  }

  const parsedFavorite = isFavoriteSchema.safeParse(isFavorite);
  if (!parsedFavorite.success) {
    return { success: false, error: parsedFavorite.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const updated = await setItemFavorite(session.user.id, parsedId.data, parsedFavorite.data);
    if (!updated) return { success: false, error: "Item not found" };
    return { success: true, data: { id: parsedId.data, isFavorite: parsedFavorite.data } };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not update the favorite. Please try again." };
  }
}
