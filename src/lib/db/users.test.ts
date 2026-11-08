import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getEditorPreferences, updateEditorPreferences } from "@/lib/db/users";
import { DEFAULT_EDITOR_PREFERENCES } from "@/lib/validations/editor-preferences";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);

const preferences = {
  fontSize: 14,
  tabSize: 4,
  wordWrap: false,
  minimap: true,
  theme: "github-dark",
} as const;

describe("getEditorPreferences", () => {
  it("reads only the preferences column for the user", async () => {
    mockFindUnique.mockResolvedValue({ editorPreferences: preferences } as never);

    const result = await getEditorPreferences("user-1");

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { editorPreferences: true },
    });
    expect(result).toEqual(preferences);
  });

  it("returns defaults when nothing is stored", async () => {
    mockFindUnique.mockResolvedValue({ editorPreferences: null } as never);
    expect(await getEditorPreferences("user-1")).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns defaults when the user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await getEditorPreferences("missing")).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("fills invalid stored fields with defaults", async () => {
    mockFindUnique.mockResolvedValue({
      editorPreferences: { ...preferences, theme: "dracula" },
    } as never);
    expect(await getEditorPreferences("user-1")).toEqual({
      ...preferences,
      theme: DEFAULT_EDITOR_PREFERENCES.theme,
    });
  });
});

describe("updateEditorPreferences", () => {
  beforeEach(() => {
    mockUpdate.mockResolvedValue({ editorPreferences: preferences } as never);
  });

  it("writes the preferences to the signed-in user's row", async () => {
    const result = await updateEditorPreferences("user-1", preferences);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: preferences },
      select: { editorPreferences: true },
    });
    expect(result).toEqual(preferences);
  });

  it("propagates database errors", async () => {
    mockUpdate.mockRejectedValue(new Error("db down"));
    await expect(updateEditorPreferences("user-1", preferences)).rejects.toThrow("db down");
  });
});
