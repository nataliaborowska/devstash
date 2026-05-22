"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Settings, ChevronDown, ChevronRight, PanelLeft, PanelRight } from "lucide-react";
import {
  mockUser,
  mockItemTypes,
  mockCollections,
  mockItemTypeCounts,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const recentCollections = mockCollections.filter((c) => !c.isFavorite);

  const initials = mockUser.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Types */}
        <button
          onClick={() => setTypesOpen(!typesOpen)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md hover:bg-accent"
        >
          Types
          {typesOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {typesOpen && (
          <div className="mt-1 space-y-0.5">
            {mockItemTypes.map((type) => (
              <Link
                key={type.id}
                href={`/items/${type.name.toLowerCase()}s`}
                onClick={onNavigate}
                className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs w-5 text-center shrink-0 font-mono"
                    style={{ color: type.color }}
                  >
                    {type.icon}
                  </span>
                  <span>{type.name}s</span>
                </div>
                <span className="text-xs tabular-nums">
                  {mockItemTypeCounts[type.id]}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="my-3 border-t border-border" />

        {/* Collections */}
        <button
          onClick={() => setCollectionsOpen(!collectionsOpen)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md hover:bg-accent"
        >
          Collections
          {collectionsOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {collectionsOpen && (
          <>
            {favoriteCollections.length > 0 && (
              <div className="mt-2">
                <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Favorites
                </p>
                <div className="space-y-0.5">
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
              </div>
            )}

            <div className="mt-3">
              <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </p>
              <div className="space-y-0.5">
                {recentCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    onClick={onNavigate}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <span className="truncate">{col.name}</span>
                    <span className="text-xs tabular-nums shrink-0 ml-1">
                      {col.itemCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
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
  className?: string;
}

export function Sidebar({ isOpen, onToggle, className }: SidebarProps) {
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
            <SidebarContent />
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
            {mockItemTypes.map((type) => (
              <Link
                key={type.id}
                href={`/items/${type.name.toLowerCase()}s`}
                title={type.name + "s"}
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors text-sm"
                style={{ color: type.color }}
              >
                {type.icon}
              </Link>
            ))}
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
