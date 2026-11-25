"use client";

import { useInView } from "@/hooks/use-in-view";
import { AI_TAGS } from "@/lib/homepage";
import { cn } from "@/lib/utils";

const FIRST_TAG_DELAY_MS = 400;
const TAG_STAGGER_MS = 180;

// Tags pop in one by one once the editor mockup scrolls into view.
export function AiTags() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5 });

  return (
    <div ref={ref} className="flex flex-wrap gap-2">
      {AI_TAGS.map((tag, i) => (
        <span
          key={tag}
          className={cn(
            "rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-xs text-violet-300",
            "motion-safe:transition-all motion-safe:duration-300",
            !inView && "motion-safe:scale-75 motion-safe:opacity-0",
          )}
          style={{ transitionDelay: `${FIRST_TAG_DELAY_MS + i * TAG_STAGGER_MS}ms` }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
