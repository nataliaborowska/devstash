"use client";

import type { ReactNode } from "react";
import { useEditorPreferences } from "@/components/settings/editor-preferences-context";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EDITOR_THEME_LABELS } from "@/lib/editor-themes";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
  type EditorTheme,
} from "@/lib/validations/editor-preferences";

interface PreferenceRowProps {
  id: string;
  label: string;
  description: string;
  children: ReactNode;
}

function PreferenceRow({ id, label, description, children }: PreferenceRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

// Every change applies to code editors immediately and auto-saves; there is no save button.
export function EditorPreferencesForm() {
  const { preferences, updatePreference } = useEditorPreferences();

  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      <PreferenceRow id="editor-font-size" label="Font size" description="Text size in code editors.">
        <Select
          value={preferences.fontSize}
          onValueChange={(value) => value !== null && updatePreference("fontSize", value)}
        >
          <SelectTrigger id="editor-font-size" className="w-full sm:w-40">
            <SelectValue>{(value: number) => `${value}px`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EDITOR_FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PreferenceRow>

      <PreferenceRow id="editor-tab-size" label="Tab size" description="Spaces per indentation level.">
        <Select
          value={preferences.tabSize}
          onValueChange={(value) => value !== null && updatePreference("tabSize", value)}
        >
          <SelectTrigger id="editor-tab-size" className="w-full sm:w-40">
            <SelectValue>{(value: number) => `${value} spaces`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EDITOR_TAB_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PreferenceRow>

      <PreferenceRow id="editor-theme" label="Theme" description="Color theme for code editors.">
        <Select
          value={preferences.theme}
          onValueChange={(value) => value !== null && updatePreference("theme", value)}
        >
          <SelectTrigger id="editor-theme" className="w-full sm:w-40">
            <SelectValue>{(value: EditorTheme) => EDITOR_THEME_LABELS[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EDITOR_THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {EDITOR_THEME_LABELS[theme]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PreferenceRow>

      <PreferenceRow
        id="editor-word-wrap"
        label="Word wrap"
        description="Wrap long lines instead of scrolling horizontally."
      >
        <Switch
          id="editor-word-wrap"
          checked={preferences.wordWrap}
          onCheckedChange={(checked) => updatePreference("wordWrap", checked)}
        />
      </PreferenceRow>

      <PreferenceRow id="editor-minimap" label="Minimap" description="Show a code overview on the right.">
        <Switch
          id="editor-minimap"
          checked={preferences.minimap}
          onCheckedChange={(checked) => updatePreference("minimap", checked)}
        />
      </PreferenceRow>
    </div>
  );
}
