"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { CreateCollectionButton } from "@/components/collections/create-collection-dialog";
import { CreateItemButton } from "@/components/items/create-item-dialog";
import { GlobalSearch } from "@/components/layout/global-search";
import { Button } from "@/components/ui/button";
import type { SearchItem } from "@/lib/db/items";

interface TopBarProps {
  searchItems: SearchItem[];
  onMobileMenuOpen?: () => void;
}

export function TopBar({ searchItems, onMobileMenuOpen }: TopBarProps) {
  return (
    <header className="h-12 border-b border-border flex items-center gap-3 px-3 shrink-0">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 lg:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white leading-none">DS</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">DevStash</span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-auto">
        <GlobalSearch items={searchItems} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <CreateCollectionButton className="hidden sm:flex" />
        <CreateItemButton />
      </div>
    </header>
  );
}
