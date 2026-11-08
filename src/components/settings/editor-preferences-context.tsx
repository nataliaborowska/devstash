"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/settings";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  // Applies the change immediately and auto-saves it; reverts if the save fails.
  updatePreference: <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => void;
}

export const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  updatePreference: () => {},
});

interface EditorPreferencesProviderProps {
  initialPreferences: EditorPreferences;
  children: ReactNode;
}

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: EditorPreferencesProviderProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  // Last values confirmed by the server, restored when a save fails.
  const savedRef = useRef(initialPreferences);
  // Only the newest save may touch state, so quick successive changes can't clobber each other.
  const latestSaveRef = useRef(0);

  async function updatePreference<K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    const saveId = ++latestSaveRef.current;

    let result: Awaited<ReturnType<typeof updateEditorPreferences>>;
    try {
      result = await updateEditorPreferences(next);
    } catch {
      result = { success: false, error: "Could not save editor preferences. Please try again." };
    }
    if (result.success) savedRef.current = result.data;
    if (saveId !== latestSaveRef.current) return;

    if (result.success) {
      setPreferences(result.data);
      toast.success("Editor preferences saved");
    } else {
      setPreferences(savedRef.current);
      toast.error(result.error);
    }
  }

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}
