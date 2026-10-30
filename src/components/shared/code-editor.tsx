"use client";

import { useState } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toMonacoLanguage } from "@/lib/code-language";
import { cn } from "@/lib/utils";

const THEME_NAME = "devstash-dark";
const MAX_HEIGHT = 400;
const READ_ONLY_MIN_HEIGHT = 40;
const EDIT_MIN_HEIGHT = 160;

// Hex equivalents of the dark theme's neutral oklch tokens in globals.css.
const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(THEME_NAME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#171717",
      "editor.lineHighlightBackground": "#262626",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#525252",
      "editorLineNumber.activeForeground": "#a3a3a3",
      "editorGutter.background": "#171717",
      "editorWidget.background": "#171717",
      "editorWidget.border": "#2e2e2e",
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": "#ffffff1a",
      "scrollbarSlider.hoverBackground": "#ffffff2e",
      "scrollbarSlider.activeBackground": "#ffffff40",
    },
  });
};

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  // Monaco language used when the item has no language set (e.g. "shell" for commands).
  fallbackLanguage?: string;
  readOnly?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  fallbackLanguage = "plaintext",
  readOnly = false,
  ariaLabel = "Code editor",
  className,
}: CodeEditorProps) {
  const minHeight = readOnly ? READ_ONLY_MIN_HEIGHT : EDIT_MIN_HEIGHT;
  const [height, setHeight] = useState(minHeight);
  const monacoLanguage = toMonacoLanguage(language, fallbackLanguage);
  const languageLabel = language?.trim() || (fallbackLanguage === "plaintext" ? "text" : fallbackLanguage);

  // Grow with the content up to MAX_HEIGHT, then scroll inside the editor.
  const handleMount: OnMount = (editor) => {
    const fitToContent = () => {
      setHeight(Math.min(Math.max(editor.getContentHeight(), minHeight), MAX_HEIGHT));
    };
    editor.onDidContentSizeChange(fitToContent);
    fitToContent();
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-1.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="font-mono text-xs text-muted-foreground">{languageLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            disabled={value === ""}
            aria-label="Copy code"
          >
            <Copy />
          </Button>
        </div>
      </div>

      <Editor
        height={height}
        value={value}
        language={monacoLanguage}
        theme={THEME_NAME}
        beforeMount={defineTheme}
        onMount={handleMount}
        onChange={(next) => onChange?.(next ?? "")}
        loading={<div className="h-full w-full animate-pulse bg-muted/40" />}
        options={{
          readOnly,
          domReadOnly: readOnly,
          ariaLabel,
          automaticLayout: true,
          fixedOverflowWidgets: true,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 13,
          lineHeight: 20,
          tabSize: 2,
          padding: { top: 10, bottom: 10 },
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: readOnly ? "none" : "line",
          contextmenu: !readOnly,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
            // Let the drawer/dialog scroll once the editor has nothing left to scroll.
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </div>
  );
}
