import { z } from "zod";

export const EDITOR_FONT_SIZES = [12, 13, 14, 16, 18, 20] as const;
export const EDITOR_TAB_SIZES = [2, 4, 8] as const;
export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;

export type EditorTheme = (typeof EDITOR_THEMES)[number];

export const editorPreferencesSchema = z.object({
  fontSize: z.literal(EDITOR_FONT_SIZES, { message: "Invalid font size" }),
  tabSize: z.literal(EDITOR_TAB_SIZES, { message: "Invalid tab size" }),
  wordWrap: z.boolean({ message: "Invalid word wrap setting" }),
  minimap: z.boolean({ message: "Invalid minimap setting" }),
  theme: z.enum(EDITOR_THEMES, { message: "Invalid theme" }),
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

// Reads stored JSON leniently: each missing or invalid field falls back to its default,
// so older or partial rows never break the editor.
export function parseEditorPreferences(value: unknown): EditorPreferences {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...DEFAULT_EDITOR_PREFERENCES };
  }

  const stored = value as Record<string, unknown>;
  const shape = editorPreferencesSchema.shape;
  const pick = <K extends keyof EditorPreferences>(key: K): EditorPreferences[K] => {
    const parsed = shape[key].safeParse(stored[key]);
    return parsed.success ? (parsed.data as EditorPreferences[K]) : DEFAULT_EDITOR_PREFERENCES[key];
  };

  return {
    fontSize: pick("fontSize"),
    tabSize: pick("tabSize"),
    wordWrap: pick("wordWrap"),
    minimap: pick("minimap"),
    theme: pick("theme"),
  };
}
