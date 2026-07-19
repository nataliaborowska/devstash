"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar, SidebarContent } from "@/components/layout/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { CollectionWithStats } from "@/lib/db/collections";

interface DashboardShellProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  children: React.ReactNode;
}

export function DashboardShell({
  itemTypes,
  favoriteCollections,
  recentCollections,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          className="hidden lg:flex"
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
        />

        {/* Mobile drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent
              itemTypes={itemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
