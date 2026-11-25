"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  chaosTransform,
  createChaosBody,
  stepChaosBody,
  type ChaosBody,
  type ChaosPointer,
} from "@/lib/chaos-physics";
import { CHAOS_ICON_IDS, TYPE_COLORS, type ChaosIconId } from "@/lib/homepage";

// Illustrative outline icons for the places developer knowledge gets scattered.
const CHAOS_ICONS: Record<ChaosIconId, { label: string; color: string; paths: ReactNode }> = {
  notion: {
    label: "Notion",
    color: "#e5e5e5",
    paths: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 16V8l6 8V8" />
      </>
    ),
  },
  github: {
    label: "GitHub",
    color: "#c9d1d9",
    paths: (
      <path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V22" />
    ),
  },
  slack: {
    label: "Slack",
    color: TYPE_COLORS.image,
    paths: (
      <>
        <rect x="13" y="2" width="3" height="8" rx="1.5" />
        <rect x="8" y="14" width="3" height="8" rx="1.5" />
        <rect x="14" y="13" width="8" height="3" rx="1.5" />
        <rect x="2" y="8" width="8" height="3" rx="1.5" />
      </>
    ),
  },
  vscode: {
    label: "VS Code",
    color: "#3ba4f0",
    paths: (
      <>
        <path d="M17 3l4 2v14l-4 2L7 12l10-9z" />
        <path d="M17 3v18" />
        <path d="M7 12L3 9v6l4-3z" />
      </>
    ),
  },
  browser: {
    label: "Browser tabs",
    color: TYPE_COLORS.link,
    paths: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18M8 5v4M13 5v4" />
      </>
    ),
  },
  terminal: {
    label: "Terminal",
    color: TYPE_COLORS.command,
    paths: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9l3 3-3 3M12 15h5" />
      </>
    ),
  },
  "text-file": {
    label: "Text file",
    color: TYPE_COLORS.file,
    paths: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
  },
  bookmark: {
    label: "Bookmark",
    color: TYPE_COLORS.prompt,
    paths: <path d="M6 3h12v18l-6-4-6 4V3z" />,
  },
};

// Floating icons that drift, bounce off the walls, pulse, and repel from the cursor.
export function ChaosIcons() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = iconRefs.current.filter((el): el is HTMLDivElement => el !== null);
    let bounds = container.getBoundingClientRect();
    let bodies: ChaosBody[] = elements.map((el, i) => createChaosBody(el.offsetWidth, bounds, i));
    const pointer: ChaosPointer = { x: 0, y: 0, active: false };

    const render = (time: number) => {
      elements.forEach((el, i) => {
        el.style.transform = chaosTransform(bodies[i], time);
        el.style.opacity = "1";
      });
    };
    render(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onResize = () => {
      bounds = container.getBoundingClientRect();
    };

    let frameId = requestAnimationFrame(function frame(time) {
      bodies = bodies.map((body) => stepChaosBody(body, bounds, pointer));
      render(time);
      frameId = requestAnimationFrame(frame);
    });

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative h-72 overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)] bg-background"
    >
      {CHAOS_ICON_IDS.map((id, i) => {
        const icon = CHAOS_ICONS[id];
        return (
          <div
            key={id}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            title={icon.label}
            className="absolute left-0 top-0 size-10 rounded-lg border border-border bg-card p-2 opacity-0 shadow-lg will-change-transform"
            style={{ color: icon.color }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-full"
            >
              {icon.paths}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
