"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Settings, ChevronDown, PanelLeft, PanelRight } from "lucide-react";
import { mockUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { getTypeIcon } from "@/lib/icon-map";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { CollectionWithStats } from "@/lib/db/collections";

interface CollapsibleGroupProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  labelClassName?: string;
  children: React.ReactNode;
}

function CollapsibleGroup({ title, isOpen, onToggle, labelClassName, children }: CollapsibleGroupProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent",
          labelClassName
        )}
      >
        {title}
        <ChevronDown
          className={cn("h-3 w-3 shrink-0 transition-transform duration-200", !isOpen && "-rotate-90")}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  onNavigate?: () => void;
}

export function SidebarContent({
  itemTypes,
  favoriteCollections,
  recentCollections,
  onNavigate,
}: SidebarContentProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  const initials = mockUser.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Types */}
        <CollapsibleGroup
          title="Types"
          isOpen={typesOpen}
          onToggle={() => setTypesOpen(!typesOpen)}
          labelClassName="text-[11px] font-semibold uppercase tracking-wider"
        >
          <div className="mt-1 space-y-0.5">
            {itemTypes.map((type) => {
              const Icon = getTypeIcon(type.icon);
              return (
                <Link
                  key={type.id}
                  href={`/items/${type.name}s`}
                  onClick={onNavigate}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: type.color ?? undefined }} />
                    <span className="capitalize">{type.name}s</span>
                  </div>
                  <span className="text-xs tabular-nums">{type.count}</span>
                </Link>
              );
            })}
          </div>
        </CollapsibleGroup>

        <div className="my-3 border-t border-border" />

        {/* Collections */}
        <CollapsibleGroup
          title="Collections"
          isOpen={collectionsOpen}
          onToggle={() => setCollectionsOpen(!collectionsOpen)}
          labelClassName="text-[11px] font-semibold uppercase tracking-wider"
        >
          {favoriteCollections.length > 0 && (
            <div className="mt-2">
              <CollapsibleGroup
                title="Favorites"
                isOpen={favoritesOpen}
                onToggle={() => setFavoritesOpen(!favoritesOpen)}
                labelClassName="text-[10px] font-semibold uppercase tracking-wider py-1"
              >
                <div className="space-y-0.5 mt-0.5">
                  {favoriteCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={onNavigate}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                        <span className="truncate">{col.name}</span>
                      </div>
                      <span className="text-xs tabular-nums shrink-0 ml-1">{col.itemCount}</span>
                    </Link>
                  ))}
                </div>
              </CollapsibleGroup>
            </div>
          )}

          <div className="mt-3">
            <CollapsibleGroup
              title="Recent"
              isOpen={recentOpen}
              onToggle={() => setRecentOpen(!recentOpen)}
              labelClassName="text-[10px] font-semibold uppercase tracking-wider py-1"
            >
              <div className="space-y-0.5 mt-0.5">
                {recentCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    onClick={onNavigate}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.dominantColor ?? "#6b7280" }}
                      />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-xs tabular-nums shrink-0 ml-1">
                      {col.itemCount}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/collections"
                onClick={onNavigate}
                className="block px-2 py-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all collections
              </Link>
            </CollapsibleGroup>
          </div>
        </CollapsibleGroup>
      </div>

      {/* User avatar */}
      <div className="shrink-0 border-t border-border p-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate leading-tight">
            {mockUser.name}
          </p>
          <p className="text-[11px] text-muted-foreground truncate leading-tight">
            {mockUser.email}
          </p>
        </div>
        <button className="shrink-0 rounded-md p-1 hover:bg-accent transition-colors">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  className?: string;
}

export function Sidebar({
  isOpen,
  onToggle,
  itemTypes,
  favoriteCollections,
  recentCollections,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-sidebar transition-all duration-200 overflow-hidden flex-col",
        isOpen ? "w-56" : "w-10",
        className
      )}
    >
      {isOpen ? (
        <div className="w-56 flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-end px-2 pt-2 shrink-0">
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SidebarContent
              itemTypes={itemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
            />
          </div>
        </div>
      ) : (
        <div className="w-10 flex flex-col flex-1 items-center pt-2 pb-3">
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <PanelRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="w-full border-t border-border my-2" />
          <div className="flex flex-col items-center gap-1">
            {itemTypes.map((type) => {
              const Icon = getTypeIcon(type.icon);
              return (
                <Link
                  key={type.id}
                  href={`/items/${type.name}s`}
                  title={`${type.name}s`}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
                  style={{ color: type.color ?? undefined }}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
          <div className="flex-1" />
          <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
            {mockUser.name.split(" ").map((n) => n[0]).join("")}
          </div>
        </div>
      )}
    </aside>
  );
}
