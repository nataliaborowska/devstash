"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  updateCollection as updateCollectionInDb,
  type CollectionSummary,
} from "@/lib/db/collections";
import {
  collectionIdSchema,
  createCollectionSchema,
  updateCollectionSchema,
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from "@/lib/validations/collections";

export type CreateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export type UpdateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export type DeleteCollectionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

const SIGNED_OUT = "You must be signed in";
const COLLECTION_NOT_FOUND = "Collection not found";
const COLLECTIONS_PATH = "/collections";

export async function createCollection(
  data: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: SIGNED_OUT };

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

export async function updateCollection(
  collectionId: string,
  data: UpdateCollectionInput
): Promise<UpdateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: SIGNED_OUT };

  const parsedId = collectionIdSchema.safeParse(collectionId);
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? "Invalid collection id" };
  }

  const parsed = updateCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const collection = await updateCollectionInDb(session.user.id, parsedId.data, parsed.data);
    if (!collection) return { success: false, error: COLLECTION_NOT_FOUND };
    return { success: true, data: collection };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not update the collection. Please try again." };
  }
}

interface DeleteCollectionOptions {
  // Set when deleting from the collection's own page, which no longer exists afterwards.
  redirectToCollections?: boolean;
}

export async function deleteCollection(
  collectionId: string,
  options: DeleteCollectionOptions = {}
): Promise<DeleteCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: SIGNED_OUT };

  const parsed = collectionIdSchema.safeParse(collectionId);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid collection id" };
  }

  try {
    const deleted = await deleteCollectionInDb(session.user.id, parsed.data);
    if (!deleted) return { success: false, error: COLLECTION_NOT_FOUND };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not delete the collection. Please try again." };
  }

  if (options.redirectToCollections) {
    // Redirecting from the server navigates in the same response as the delete, so the client
    // never re-renders the deleted page; revalidating the root layout drops it from the sidebar.
    // Must stay outside the try/catch because redirect() works by throwing.
    revalidatePath("/", "layout");
    redirect(COLLECTIONS_PATH);
  }

  return { success: true, data: { id: parsed.data } };
}
