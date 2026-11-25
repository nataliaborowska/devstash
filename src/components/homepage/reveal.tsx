"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
}

// Fades children in when they scroll into view; shown immediately with reduced motion.
export function Reveal({ children, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        !inView && "motion-safe:translate-y-6 motion-safe:opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
