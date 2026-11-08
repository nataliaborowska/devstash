import type { Monaco } from "@monaco-editor/react";
import type { EditorTheme } from "@/lib/validations/editor-preferences";

type ThemeData = Parameters<Monaco["editor"]["defineTheme"]>[1];

// Shared tweaks so every theme keeps the editor's minimal, borderless chrome.
const CHROME_COLORS: ThemeData["colors"] = {
  "editor.lineHighlightBorder": "#00000000",
  "scrollbar.shadow": "#00000000",
  "scrollbarSlider.background": "#ffffff1a",
  "scrollbarSlider.hoverBackground": "#ffffff2e",
  "scrollbarSlider.activeBackground": "#ffffff40",
};

const MONOKAI: ThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "f8f8f2" },
    { token: "comment", foreground: "75715e", fontStyle: "italic" },
    { token: "string", foreground: "e6db74" },
    { token: "number", foreground: "ae81ff" },
    { token: "constant", foreground: "ae81ff" },
    { token: "keyword", foreground: "f92672" },
    { token: "operator", foreground: "f92672" },
    { token: "type", foreground: "66d9ef", fontStyle: "italic" },
    { token: "function", foreground: "a6e22e" },
    { token: "variable", foreground: "f8f8f2" },
    { token: "tag", foreground: "f92672" },
    { token: "attribute.name", foreground: "a6e22e" },
    { token: "attribute.value", foreground: "e6db74" },
    { token: "delimiter", foreground: "f8f8f2" },
  ],
  colors: {
    ...CHROME_COLORS,
    "editor.background": "#272822",
    "editor.foreground": "#f8f8f2",
    "editor.lineHighlightBackground": "#3e3d32",
    "editor.selectionBackground": "#49483e",
    "editorCursor.foreground": "#f8f8f0",
    "editorLineNumber.foreground": "#90908a",
    "editorLineNumber.activeForeground": "#f8f8f2",
    "editorIndentGuide.background1": "#3b3a32",
    "editorWidget.background": "#1e1f1c",
  },
};

const GITHUB_DARK: ThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "e6edf3" },
    { token: "comment", foreground: "8b949e", fontStyle: "italic" },
    { token: "string", foreground: "a5d6ff" },
    { token: "number", foreground: "79c0ff" },
    { token: "constant", foreground: "79c0ff" },
    { token: "keyword", foreground: "ff7b72" },
    { token: "operator", foreground: "ff7b72" },
    { token: "type", foreground: "ffa657" },
    { token: "function", foreground: "d2a8ff" },
    { token: "variable", foreground: "ffa657" },
    { token: "tag", foreground: "7ee787" },
    { token: "attribute.name", foreground: "79c0ff" },
    { token: "attribute.value", foreground: "a5d6ff" },
    { token: "delimiter", foreground: "e6edf3" },
  ],
  colors: {
    ...CHROME_COLORS,
    "editor.background": "#0d1117",
    "editor.foreground": "#e6edf3",
    "editor.lineHighlightBackground": "#161b22",
    "editor.selectionBackground": "#264f78",
    "editorCursor.foreground": "#e6edf3",
    "editorLineNumber.foreground": "#6e7681",
    "editorLineNumber.activeForeground": "#e6edf3",
    "editorIndentGuide.background1": "#21262d",
    "editorWidget.background": "#161b22",
    "editorWidget.border": "#30363d",
  },
};

// Monaco's built-in vs-dark with the shared chrome tweaks.
const VS_DARK: ThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: CHROME_COLORS,
};

export const EDITOR_THEME_DATA: Record<EditorTheme, ThemeData> = {
  "vs-dark": VS_DARK,
  monokai: MONOKAI,
  "github-dark": GITHUB_DARK,
};

// Prefixed so the registered themes never shadow Monaco's built-in names.
export function toMonacoThemeName(theme: EditorTheme): string {
  return `devstash-${theme}`;
}

export const EDITOR_THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};
