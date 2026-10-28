"use server";

import { auth } from "@/auth";
import { updateItem as updateItemInDb, type ItemDetail } from "@/lib/db/items";
import { updateItemSchema, type UpdateItemInput } from "@/lib/validations/items";

export type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(itemId: string, data: UpdateItemInput): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const item = await updateItemInDb(session.user.id, itemId, parsed.data);
    if (!item) return { success: false, error: "Item not found" };
    return { success: true, data: item };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the item. Please try again." };
  }
}
