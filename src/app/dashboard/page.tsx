export const dynamic = "force-dynamic";

import Link from "next/link";
import { mockItems } from "@/lib/mock-data";
import { getRecentCollections } from "@/lib/db/collections";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { ItemCard } from "@/components/dashboard/item-card";

const pinnedItems = mockItems.filter((i) => i.isPinned);

const recentItems = [...mockItems]
  .sort((a, b) => {
    const aDate = a.lastUsedAt ?? a.createdAt;
    const bDate = b.lastUsedAt ?? b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  })
  .slice(0, 10);

export default async function DashboardPage() {
  const recentCollections = await getRecentCollections(6);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your developer knowledge hub
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Collections</h2>
          <Link
            href="/collections"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4">Pinned</h2>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Items</h2>
          <Link
            href="/items"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
