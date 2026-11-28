import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-6 rounded-md", icon: "size-3.5" },
  md: { box: "size-8 rounded-lg", icon: "size-4.5" },
  lg: { box: "size-9 rounded-lg", icon: "size-5" },
} as const;

interface LogoMarkProps {
  size?: keyof typeof SIZES;
  className?: string;
}

// DevStash brand mark: gradient box with the Layers icon. Decorative; pair it with a label.
export function LogoMark({ size = "md", className }: LogoMarkProps) {
  const { box, icon } = SIZES[size];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600",
        box,
        className,
      )}
      aria-hidden="true"
    >
      <Layers className={cn("text-white", icon)} />
    </span>
  );
}
