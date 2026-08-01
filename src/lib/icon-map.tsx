import type { CSSProperties } from "react";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image as ImageIcon,
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
  Image: ImageIcon,
  Link,
};

export function getTypeIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && ICON_MAP[iconName]) || HelpCircle;
}

interface TypeIconProps {
  name: string | null | undefined;
  className?: string;
  style?: CSSProperties;
}

export function TypeIcon({ name, className, style }: TypeIconProps) {
  switch (name) {
    case "Code":
      return <Code className={className} style={style} />;
    case "Sparkles":
      return <Sparkles className={className} style={style} />;
    case "Terminal":
      return <Terminal className={className} style={style} />;
    case "StickyNote":
      return <StickyNote className={className} style={style} />;
    case "File":
      return <File className={className} style={style} />;
    case "Image":
      return <ImageIcon className={className} style={style} />;
    case "Link":
      return <Link className={className} style={style} />;
    default:
      return <HelpCircle className={className} style={style} />;
  }
}
