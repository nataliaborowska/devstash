import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function getTypeIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && ICON_MAP[iconName]) || HelpCircle;
}
