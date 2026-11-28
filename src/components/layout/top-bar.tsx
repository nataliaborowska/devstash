"use client";

import Link from "next/link";
import { Menu, Star } from "lucide-react";
import { CreateCollectionButton } from "@/components/collections/create-collection-dialog";
import { CreateItemButton } from "@/components/items/create-item-dialog";
import { GlobalSearch } from "@/components/layout/global-search";
import { LogoMark } from "@/components/shared/logo-mark";
import { Button } from "@/components/ui/button";
import type { SearchItem } from "@/lib/db/items";

// Square 44px icon buttons (touch targets) on small screens, 32px labelled buttons from md up.
const ICON_ONLY_BELOW_MD = "size-11 px-0 md:h-8 md:w-auto md:px-2.5";
const ICON_BUTTON = "size-11 shrink-0 md:size-8";

interface TopBarProps {
  searchItems: SearchItem[];
  onMobileMenuOpen?: () => void;
}

export function TopBar({ searchItems, onMobileMenuOpen }: TopBarProps) {
  return (
    <header className="h-12 border-b border-border flex items-center gap-2 sm:gap-3 px-3 shrink-0">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className={`${ICON_BUTTON} -ml-1.5 lg:hidden`}
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Logo */}
      <Link
        href="/"
        className="flex min-h-11 min-w-11 items-center gap-2 shrink-0 rounded-md md:min-h-0 md:min-w-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <LogoMark size="sm" />
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">DevStash</span>
      </Link>

      {/* Search: icon button on mobile (right-aligned), full bar from sm up */}
      <div className="flex min-w-0 flex-1 justify-end sm:mx-auto sm:max-w-sm sm:justify-start">
        <GlobalSearch items={searchItems} />
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={ICON_BUTTON}
          nativeButton={false}
          render={<Link href="/favorites" aria-label="Favorites" title="Favorites" />}
        >
          <Star className="h-4 w-4" />
        </Button>
        <CreateCollectionButton className={ICON_ONLY_BELOW_MD} labelClassName="hidden md:inline" />
        <CreateItemButton className={ICON_ONLY_BELOW_MD} labelClassName="hidden md:inline" />
      </div>
    </header>
  );
}
