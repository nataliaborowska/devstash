"use server";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  type CollectionSummary,
} from "@/lib/db/collections";
import {
  createCollectionSchema,
  type CreateCollectionInput,
} from "@/lib/validations/collections";

export type CreateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export async function createCollection(
  data: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const collection = await createCollectionInDb(session.user.id, parsed.data);
    return { success: true, data: collection };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not create the collection. Please try again." };
  }
}
