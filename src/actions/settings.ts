"use server";

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/users";
import {
  editorPreferencesSchema,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences";

export type UpdateEditorPreferencesResult =
  | { success: true; data: EditorPreferences }
  | { success: false; error: string };

export async function updateEditorPreferences(
  data: EditorPreferences
): Promise<UpdateEditorPreferencesResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = editorPreferencesSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const preferences = await updateEditorPreferencesInDb(session.user.id, parsed.data);
    return { success: true, data: preferences };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save editor preferences. Please try again." };
  }
}
