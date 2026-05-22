"use client";

import { Search, Plus, FolderPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onMobileMenuOpen?: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
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
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white leading-none">DS</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">DevStash</span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-9 h-8 text-sm bg-muted border-0 focus-visible:ring-1"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs hidden sm:flex">
          <FolderPlus className="h-3.5 w-3.5" />
          New Collection
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
