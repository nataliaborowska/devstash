"use client";

import { useSyncExternalStore } from "react";
import { LinkButton } from "@/components/homepage/link-button";
import { Logo } from "@/components/homepage/logo";
import { NAV_ACTIONS, NAV_LINKS } from "@/lib/homepage";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 20;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getServerScrolled = () => false;

export function HomepageNav() {
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolled, getServerScrolled);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-md"
          : "border-transparent bg-background/40 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LinkButton href={NAV_ACTIONS.signIn.href} variant="ghost">
            {NAV_ACTIONS.signIn.label}
          </LinkButton>
          <LinkButton href={NAV_ACTIONS.getStarted.href}>{NAV_ACTIONS.getStarted.label}</LinkButton>
        </div>
      </div>
    </header>
  );
}
