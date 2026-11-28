import Link from "next/link";
import { LogoMark } from "@/components/shared/logo-mark";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="DevStash home"
      className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">DevStash</span>
    </Link>
  );
}
