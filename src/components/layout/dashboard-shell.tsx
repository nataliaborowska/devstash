"use client";

import { useState } from "react";
import { CollectionOptionsProvider } from "@/components/collections/collection-select";
import { CreateItemDialogProvider } from "@/components/items/create-item-dialog";
import { ItemDrawerProvider } from "@/components/items/item-drawer-provider";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar, SidebarContent } from "@/components/layout/sidebar";
import { EditorPreferencesProvider } from "@/components/settings/editor-preferences-context";
import { LogoMark } from "@/components/shared/logo-mark";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ItemTypeWithCount, SearchItem } from "@/lib/db/items";
import type { CollectionOption, CollectionWithStats } from "@/lib/db/collections";
import type { SidebarUser } from "@/lib/db/users";
import type { EditorPreferences } from "@/lib/validations/editor-preferences";

interface DashboardShellProps {
  user: SidebarUser;
  editorPreferences: EditorPreferences;
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  collectionOptions: CollectionOption[];
  searchItems: SearchItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  editorPreferences,
  itemTypes,
  favoriteCollections,
  recentCollections,
  collectionOptions,
  searchItems,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
      <CollectionOptionsProvider collections={collectionOptions}>
        <CreateItemDialogProvider itemTypes={itemTypes}>
          <ItemDrawerProvider>
            <div className="flex flex-col h-screen">
              <TopBar searchItems={searchItems} onMobileMenuOpen={() => setMobileOpen(true)} />

              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Desktop sidebar */}
                <Sidebar
                  user={user}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen((prev) => !prev)}
                  className="hidden lg:flex"
                  itemTypes={itemTypes}
                  favoriteCollections={favoriteCollections}
                  recentCollections={recentCollections}
                />

                {/* Mobile drawer */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetContent side="left" className="w-64 gap-0 p-0">
                    {/* Header row keeps the sheet's close button clear of the first nav group. */}
                    <SheetHeader className="h-14 shrink-0 flex-row items-center border-b border-border px-4 pr-14">
                      <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                        <LogoMark size="sm" />
                        DevStash
                      </SheetTitle>
                    </SheetHeader>
                    <SidebarContent
                      user={user}
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
          </ItemDrawerProvider>
        </CreateItemDialogProvider>
      </CollectionOptionsProvider>
    </EditorPreferencesProvider>
  );
}
