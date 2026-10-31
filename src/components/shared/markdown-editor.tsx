"use client";

import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarkdownTab = "write" | "preview";

// Rendered links always open outside the app.
const MARKDOWN_COMPONENTS: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  // Id of the write textarea, so a surrounding <label htmlFor> can target it.
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  id,
  ariaLabel = "Markdown editor",
  placeholder = "Write Markdown...",
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<MarkdownTab>(readOnly ? "preview" : "write");
  const activeTab = readOnly ? "preview" : tab;
  const tabs: MarkdownTab[] = readOnly ? ["preview"] : ["write", "preview"];

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
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
        <div role="tablist" aria-label={ariaLabel} className="flex gap-1">
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={activeTab === name}
              onClick={() => setTab(name)}
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium capitalize transition-colors",
                activeTab === name
                  ? "bg-background/60 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          disabled={value === ""}
          aria-label="Copy content"
          className="ml-auto"
        >
          <Copy />
        </Button>
      </div>

      {activeTab === "write" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={id ? undefined : ariaLabel}
          placeholder={placeholder}
          spellCheck={false}
          className="scrollbar-thin block field-sizing-content max-h-[400px] min-h-40 w-full resize-none bg-transparent px-4 py-3 font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <div className={cn("scrollbar-thin max-h-[400px] overflow-auto px-4 py-3", !readOnly && "min-h-40")}>
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
