import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/users";
import { updateEditorPreferences } from "@/actions/settings";
import type { EditorPreferences } from "@/lib/validations/editor-preferences";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/users", () => ({ updateEditorPreferences: vi.fn() }));

const mockAuth = vi.mocked(auth as unknown as () => Promise<{ user: { id: string } } | null>);
const mockUpdateInDb = vi.mocked(updateEditorPreferencesInDb);

const preferences: EditorPreferences = {
  fontSize: 16,
  tabSize: 4,
  wordWrap: false,
  minimap: true,
  theme: "monokai",
};

describe("updateEditorPreferences", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateInDb.mockResolvedValue(preferences);
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await updateEditorPreferences(preferences);
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockUpdateInDb).not.toHaveBeenCalled();
  });

  it("rejects invalid preferences", async () => {
    const result = await updateEditorPreferences({
      ...preferences,
      theme: "dracula",
    } as unknown as EditorPreferences);
    expect(result).toEqual({ success: false, error: "Invalid theme" });
    expect(mockUpdateInDb).not.toHaveBeenCalled();
  });

  it("rejects a font size outside the allowed options", async () => {
    const result = await updateEditorPreferences({
      ...preferences,
      fontSize: 99,
    } as unknown as EditorPreferences);
    expect(result).toEqual({ success: false, error: "Invalid font size" });
  });

  it("saves validated preferences for the signed-in user", async () => {
    const result = await updateEditorPreferences({
      ...preferences,
      extra: "ignored",
    } as unknown as EditorPreferences);

    expect(mockUpdateInDb).toHaveBeenCalledWith("user-1", preferences);
    expect(result).toEqual({ success: true, data: preferences });
  });

  it("returns a friendly error when saving fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockUpdateInDb.mockRejectedValue(new Error("db down"));

    const result = await updateEditorPreferences(preferences);

    expect(result).toEqual({
      success: false,
      error: "Could not save editor preferences. Please try again.",
    });
  });
});
