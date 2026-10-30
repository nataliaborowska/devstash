// Common aliases users type for an item's language, mapped to Monaco language ids.
const MONACO_LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  node: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  golang: "go",
  cs: "csharp",
  "c#": "csharp",
  "c++": "cpp",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  ps: "powershell",
  ps1: "powershell",
  pwsh: "powershell",
  yml: "yaml",
  md: "markdown",
  htm: "html",
  kt: "kotlin",
  dockerfile: "dockerfile",
  docker: "dockerfile",
  postgres: "pgsql",
  postgresql: "pgsql",
  text: "plaintext",
  txt: "plaintext",
};

// Item types whose content is shown and edited in the code editor instead of a textarea.
export const CODE_ITEM_TYPES: readonly string[] = ["snippet", "command"];

// Commands without a language are highlighted as shell.
export function getFallbackCodeLanguage(typeName: string) {
  return typeName === "command" ? "shell" : "plaintext";
}

export function toMonacoLanguage(language: string | null | undefined, fallback = "plaintext") {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return fallback;
  return MONACO_LANGUAGE_ALIASES[normalized] ?? normalized;
}
