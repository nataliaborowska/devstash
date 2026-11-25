import Link from "next/link";
import { Layers } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="DevStash home"
      className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
        <Layers className="size-4.5 text-white" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">DevStash</span>
    </Link>
  );
}
